import { create } from "zustand";
import { toast } from "sonner";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { ReviewFinding } from "@/types/review";
import enMessages from "@/i18n/locales/en.json";
import zhMessages from "@/i18n/locales/zh.json";

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

interface UndoEntry {
  resumeId: string;
  snapshot: Record<string, unknown>;
  findingIds: string[];
}

interface ReviewStore {
  isReviewing: boolean;
  findings: ReviewFinding[];
  overallScore: number | null;
  selectedFindingIndex: number | null;
  appliedIds: Set<string>;
  checkedIds: Set<string>;
  undoStack: UndoEntry[];
  viewMode: "cards" | "checklist";
  categoryFilter: string;

  setIsReviewing: (v: boolean) => void;
  setFindings: (findings: ReviewFinding[], score: number) => void;
  clearReview: () => void;
  selectFinding: (index: number) => void;
  markApplied: (id: string) => void;
  toggleChecked: (id: string) => void;
  setChecked: (ids: Set<string>) => void;
  setViewMode: (mode: "cards" | "checklist") => void;
  setCategoryFilter: (cat: string) => void;
  pushUndo: (entry: UndoEntry) => void;
  popUndo: () => UndoEntry | undefined;
  reviewResume: (serializedResume: string) => Promise<void>;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  isReviewing: false,
  findings: [],
  overallScore: null,
  selectedFindingIndex: null,
  appliedIds: new Set(),
  checkedIds: new Set(),
  undoStack: [],
  viewMode: "cards",
  categoryFilter: "all",

  setIsReviewing: (v) => set({ isReviewing: v }),
  setFindings: (findings, score) => set({ findings, overallScore: score, appliedIds: new Set(), checkedIds: new Set() }),
  clearReview: () => set({ findings: [], overallScore: null, selectedFindingIndex: null, appliedIds: new Set(), checkedIds: new Set(), undoStack: [] }),
  selectFinding: (index) => set({ selectedFindingIndex: index }),
  markApplied: (id) => set((state) => {
    const next = new Set(state.appliedIds);
    next.add(id);
    return { appliedIds: next };
  }),
  toggleChecked: (id) => set((state) => {
    const next = new Set(state.checkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return { checkedIds: next };
  }),
  setChecked: (ids) => set({ checkedIds: ids }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCategoryFilter: (cat) => set({ categoryFilter: cat }),
  pushUndo: (entry) => set((state) => ({ undoStack: [...state.undoStack.slice(-19), entry] })),
  popUndo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return undefined;
    const last = undoStack[undoStack.length - 1];
    set({ undoStack: undoStack.slice(0, -1) });
    return last;
  },

  reviewResume: async (serializedResume: string) => {
    const { selectedModel, doubaoApiKey, doubaoModelId, deepseekApiKey, deepseekModelId, openaiApiKey, openaiModelId, openaiApiEndpoint, geminiApiKey, geminiModelId, anthropicApiKey, anthropicModelId, anthropicApiEndpoint } = useAIConfigStore.getState();

    const config = AI_MODEL_CONFIGS[selectedModel];
    const apiKey = selectedModel === "doubao" ? doubaoApiKey : selectedModel === "openai" ? openaiApiKey : selectedModel === "gemini" ? geminiApiKey : selectedModel === "anthropic" ? anthropicApiKey : deepseekApiKey;
    const modelId = selectedModel === "doubao" ? doubaoModelId : selectedModel === "openai" ? openaiModelId : selectedModel === "gemini" ? geminiModelId : selectedModel === "anthropic" ? anthropicModelId : deepseekModelId;
    const endpoint = selectedModel === "openai" ? openaiApiEndpoint : selectedModel === "anthropic" ? anthropicApiEndpoint : undefined;

    set({ isReviewing: true, findings: [], overallScore: null });

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: serializedResume,
          apiKey,
          model: config.requiresModelId ? modelId : config.defaultModel,
          modelType: selectedModel,
          apiEndpoint: endpoint,
        }),
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status}`);

      const data = await response.json();
      if (data.error) {
        toast.error(data.error.message || t("aiReview.error.reviewFailed"));
        throw new Error(data.error.message);
      }

      const findings = data.findings || [];
      const score = data.overallScore ?? 0;
      set({ findings, overallScore: score });

      if (findings.length === 0) {
        toast.success(t("aiReview.noFindings"));
      }
    } catch {
      set({ findings: [], overallScore: null });
    } finally {
      set({ isReviewing: false });
    }
  },
}));
