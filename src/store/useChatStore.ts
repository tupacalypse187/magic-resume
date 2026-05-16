import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatMessage, ChatSession } from "@/types/review";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { useResumeStore } from "@/store/useResumeStore";
import { serializeResumeForAI } from "@/utils/resumeSerializer";
import enMessages from "@/i18n/locales/en.json";
import zhMessages from "@/i18n/locales/zh.json";
import { toast } from "sonner";

function getLocale() {
  if (typeof document === "undefined") return "en";
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("NEXT_LOCALE="))
    ?.split("=")[1] || "en";
}

function t(key: string) {
  const locale = getLocale();
  const messages = locale === "en" ? enMessages : zhMessages;
  const parts = key.split(".");
  let result: unknown = messages;
  for (const part of parts) {
    result = (result as Record<string, unknown>)?.[part];
  }
  return typeof result === "string" ? result : key;
}

interface ChatStore {
  sessions: Record<string, ChatSession[]>;
  activeSessionId: string | null;
  isOpen: boolean;
  isStreaming: boolean;
  abortController: AbortController | null;

  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  createSession: (resumeId: string) => string;
  deleteSession: (resumeId: string, sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  getActiveSessions: (resumeId: string) => ChatSession[];
  getActiveSession: () => ChatSession | null;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
}

const CHAT_SYSTEM_PROMPT = `You are an expert resume advisor and career coach. The user will share their resume with you and ask for help improving it.

Your capabilities:
- Review and critique resume content
- Suggest improvements to specific sections
- Recommend keywords and skills to add
- Help rephrase bullet points for impact
- Provide ATS optimization advice
- Suggest formatting and structure changes
- Help with career strategy and positioning

Guidelines:
- Be specific and actionable in your suggestions
- When suggesting text changes, clearly indicate what should be replaced
- Consider the user's target industry and role (ask if not clear)
- Be encouraging but honest about areas that need improvement
- Use markdown formatting in your responses for clarity
- Keep responses concise and focused`;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,
      isOpen: false,
      isStreaming: false,
      abortController: null,

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),

      createSession: (resumeId: string) => {
        const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const session: ChatSession = {
          id,
          resumeId,
          title: "",
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => {
          const sessions = { ...state.sessions };
          sessions[resumeId] = [session, ...(sessions[resumeId] || [])];
          return { sessions, activeSessionId: id };
        });
        return id;
      },

      deleteSession: (resumeId, sessionId) => {
        set((state) => {
          const sessions = { ...state.sessions };
          sessions[resumeId] = (sessions[resumeId] || []).filter((s) => s.id !== sessionId);
          const newActive = state.activeSessionId === sessionId
            ? (sessions[resumeId]?.[0]?.id ?? null)
            : state.activeSessionId;
          return { sessions, activeSessionId: newActive };
        });
      },

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

      getActiveSessions: (resumeId) => {
        return get().sessions[resumeId] || [];
      },

      getActiveSession: () => {
        const { activeSessionId, sessions } = get();
        if (!activeSessionId) return null;
        for (const resumeSessions of Object.values(sessions)) {
          const found = resumeSessions.find((s) => s.id === activeSessionId);
          if (found) return found;
        }
        return null;
      },

      sendMessage: async (content: string) => {
        const state = get();
        const resumeStore = useResumeStore.getState();
        const activeResume = resumeStore.activeResume;
        if (!activeResume) return;

        let sessionId = state.activeSessionId;
        if (!sessionId) {
          sessionId = get().createSession(activeResume.id);
        }

        // Add user message
        const userMsg: ChatMessage = {
          id: `msg-${Date.now()}-user`,
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const sessions = { ...state.sessions };
          const resumeSessions = [...(sessions[activeResume.id] || [])];
          const sessionIdx = resumeSessions.findIndex((s) => s.id === sessionId);
          if (sessionIdx === -1) return state;

          const session = { ...resumeSessions[sessionIdx] };
          session.messages = [...session.messages, userMsg];
          if (!session.title) {
            session.title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
          }
          session.updatedAt = new Date().toISOString();
          resumeSessions[sessionIdx] = session;
          sessions[activeResume.id] = resumeSessions;
          return { sessions, activeSessionId: sessionId };
        });

        // Prepare AI call
        const {
          selectedModel, doubaoApiKey, doubaoModelId,
          deepseekApiKey, deepseekModelId,
          openaiApiKey, openaiModelId, openaiApiEndpoint,
          geminiApiKey, geminiModelId,
          anthropicApiKey, anthropicModelId, anthropicApiEndpoint,
        } = useAIConfigStore.getState();

        const config = AI_MODEL_CONFIGS[selectedModel];
        const apiKey = selectedModel === "doubao" ? doubaoApiKey
          : selectedModel === "openai" ? openaiApiKey
          : selectedModel === "gemini" ? geminiApiKey
          : selectedModel === "anthropic" ? anthropicApiKey
          : deepseekApiKey;
        const modelId = selectedModel === "doubao" ? doubaoModelId
          : selectedModel === "openai" ? openaiModelId
          : selectedModel === "gemini" ? geminiModelId
          : selectedModel === "anthropic" ? anthropicModelId
          : deepseekModelId;
        const endpoint = selectedModel === "openai" ? openaiApiEndpoint
          : selectedModel === "anthropic" ? anthropicApiEndpoint
          : undefined;

        // Get current session messages for context
        const currentSession = get().sessions[activeResume.id]?.find((s) => s.id === sessionId);
        const previousMessages = currentSession?.messages || [];

        // Build conversation for the API
        const resumeContext = serializeResumeForAI(activeResume);

        const abortController = new AbortController();
        set({ isStreaming: true, abortController });

        // Add placeholder assistant message
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const sessions = { ...state.sessions };
          const resumeSessions = [...(sessions[activeResume.id] || [])];
          const sessionIdx = resumeSessions.findIndex((s) => s.id === sessionId);
          if (sessionIdx === -1) return state;
          const session = { ...resumeSessions[sessionIdx] };
          session.messages = [...session.messages, assistantMsg];
          session.updatedAt = new Date().toISOString();
          resumeSessions[sessionIdx] = session;
          sessions[activeResume.id] = resumeSessions;
          return { sessions };
        });

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: abortController.signal,
            body: JSON.stringify({
              apiKey,
              model: config.requiresModelId ? modelId : config.defaultModel,
              modelType: selectedModel,
              apiEndpoint: endpoint,
              resumeContext,
              messages: previousMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              newMessage: content,
            }),
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let fullContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullContent += chunk;

            // Update the assistant message
            set((state) => {
              const sessions = { ...state.sessions };
              const resumeSessions = [...(sessions[activeResume.id] || [])];
              const sessionIdx = resumeSessions.findIndex((s) => s.id === sessionId);
              if (sessionIdx === -1) return state;
              const session = { ...resumeSessions[sessionIdx] };
              const msgs = [...session.messages];
              const lastMsg = msgs[msgs.length - 1];
              if (lastMsg?.role === "assistant") {
                msgs[msgs.length - 1] = { ...lastMsg, content: fullContent };
              }
              session.messages = msgs;
              resumeSessions[sessionIdx] = session;
              sessions[activeResume.id] = resumeSessions;
              return { sessions };
            });
          }
        } catch (error: unknown) {
          if (error instanceof DOMException && error.name === "AbortError") {
            // User cancelled, that's fine
          } else {
            toast.error(t("aiChat.error.sendFailed"));
          }
        } finally {
          set({ isStreaming: false, abortController: null });
        }
      },

      stopStreaming: () => {
        const { abortController } = get();
        abortController?.abort();
        set({ isStreaming: false, abortController: null });
      },
    }),
    {
      name: "chat-sessions-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
