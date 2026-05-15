import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AI_MODEL_CONFIGS, AIModelType } from "@/config/ai";

interface AIConfigState {
  selectedModel: AIModelType;
  doubaoApiKey: string;
  doubaoModelId: string;
  deepseekApiKey: string;
  deepseekModelId: string;
  openaiApiKey: string;
  openaiModelId: string;
  openaiApiEndpoint: string;
  geminiApiKey: string;
  geminiModelId: string;
  setSelectedModel: (model: AIModelType) => void;
  setDoubaoApiKey: (apiKey: string) => void;
  setDoubaoModelId: (modelId: string) => void;
  setDeepseekApiKey: (apiKey: string) => void;
  setDeepseekModelId: (modelId: string) => void;
  setOpenaiApiKey: (apiKey: string) => void;
  setOpenaiModelId: (modelId: string) => void;
  setOpenaiApiEndpoint: (endpoint: string) => void;
  setGeminiApiKey: (apiKey: string) => void;
  setGeminiModelId: (modelId: string) => void;
  isConfigured: () => boolean;
  loadFromFileDefaults: () => Promise<void>;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      selectedModel: "doubao",
      doubaoApiKey: "",
      doubaoModelId: "",
      deepseekApiKey: "",
      deepseekModelId: "",
      openaiApiKey: "",
      openaiModelId: "",
      openaiApiEndpoint: "",
      geminiApiKey: "",
      geminiModelId: "gemini-flash-latest",
      setSelectedModel: (model: AIModelType) => set({ selectedModel: model }),
      setDoubaoApiKey: (apiKey: string) => set({ doubaoApiKey: apiKey }),
      setDoubaoModelId: (modelId: string) => set({ doubaoModelId: modelId }),
      setDeepseekApiKey: (apiKey: string) => set({ deepseekApiKey: apiKey }),
      setDeepseekModelId: (modelId: string) => set({ deepseekModelId: modelId }),
      setOpenaiApiKey: (apiKey: string) => set({ openaiApiKey: apiKey }),
      setOpenaiModelId: (modelId: string) => set({ openaiModelId: modelId }),
      setOpenaiApiEndpoint: (endpoint: string) => set({ openaiApiEndpoint: endpoint }),
      setGeminiApiKey: (apiKey: string) => set({ geminiApiKey: apiKey }),
      setGeminiModelId: (modelId: string) => set({ geminiModelId: modelId }),
      isConfigured: () => {
        const state = get();
        const config = AI_MODEL_CONFIGS[state.selectedModel];
        return config.validate(state);
      },
      loadFromFileDefaults: async () => {
        try {
          const res = await fetch("/api/ai-config");
          if (!res.ok) return;
          const defaults = await res.json();
          if (!defaults || typeof defaults !== "object") return;

          const state = get();
          const merge = (current: string, fallback: string) =>
            current || fallback || "";

          set({
            selectedModel: defaults.selectedModel || state.selectedModel,
            doubaoApiKey: merge(state.doubaoApiKey, defaults.doubaoApiKey),
            doubaoModelId: merge(state.doubaoModelId, defaults.doubaoModelId),
            deepseekApiKey: merge(state.deepseekApiKey, defaults.deepseekApiKey),
            deepseekModelId: merge(state.deepseekModelId, defaults.deepseekModelId),
            openaiApiKey: merge(state.openaiApiKey, defaults.openaiApiKey),
            openaiModelId: merge(state.openaiModelId, defaults.openaiModelId),
            openaiApiEndpoint: merge(state.openaiApiEndpoint, defaults.openaiApiEndpoint),
            geminiApiKey: merge(state.geminiApiKey, defaults.geminiApiKey),
            geminiModelId: merge(state.geminiModelId, defaults.geminiModelId),
          });
        } catch {
          // File defaults not available, that's fine
        }
      }
    }),
    {
      name: "ai-config-storage"
    }
  )
);
