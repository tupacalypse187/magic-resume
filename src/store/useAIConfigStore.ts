import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AI_MODEL_CONFIGS,
  AIModelType,
  CustomAIProvider,
} from "@/config/ai";
import { generateUUID } from "@/utils/uuid";

/** Selection can be a built-in provider id or `custom:<providerId>`. */
export type SelectedModel = AIModelType | `custom:${string}`;

export interface AIRequestParams {
  modelType: AIModelType;
  apiKey: string;
  model: string;
  apiEndpoint?: string;
  /** True when the active selection is a user-defined custom provider. */
  isCustom: boolean;
}

interface AIConfigState {
  selectedModel: SelectedModel;
  doubaoApiKey: string;
  doubaoModelId: string;
  deepseekApiKey: string;
  deepseekModelId: string;
  openaiApiKey: string;
  openaiModelId: string;
  openaiApiEndpoint: string;
  geminiApiKey: string;
  geminiModelId: string;
  anthropicApiKey: string;
  anthropicModelId: string;
  anthropicApiEndpoint: string;
  customProviders: CustomAIProvider[];
  setSelectedModel: (model: SelectedModel) => void;
  setDoubaoApiKey: (apiKey: string) => void;
  setDoubaoModelId: (modelId: string) => void;
  setDeepseekApiKey: (apiKey: string) => void;
  setDeepseekModelId: (modelId: string) => void;
  setOpenaiApiKey: (apiKey: string) => void;
  setOpenaiModelId: (modelId: string) => void;
  setOpenaiApiEndpoint: (endpoint: string) => void;
  setGeminiApiKey: (apiKey: string) => void;
  setGeminiModelId: (modelId: string) => void;
  setAnthropicApiKey: (apiKey: string) => void;
  setAnthropicModelId: (modelId: string) => void;
  setAnthropicApiEndpoint: (endpoint: string) => void;
  addCustomProvider: (provider: Omit<CustomAIProvider, "id">) => string;
  updateCustomProvider: (id: string, patch: Partial<CustomAIProvider>) => void;
  removeCustomProvider: (id: string) => void;
  /** Resolve the active selection into dispatch params (built-in OR custom). */
  getActiveRequestParams: () => AIRequestParams;
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
      anthropicApiKey: "",
      anthropicModelId: "",
      anthropicApiEndpoint: "",
      customProviders: [],
      setSelectedModel: (model: SelectedModel) => set({ selectedModel: model }),
      setDoubaoApiKey: (apiKey: string) => set({ doubaoApiKey: apiKey }),
      setDoubaoModelId: (modelId: string) => set({ doubaoModelId: modelId }),
      setDeepseekApiKey: (apiKey: string) => set({ deepseekApiKey: apiKey }),
      setDeepseekModelId: (modelId: string) => set({ deepseekModelId: modelId }),
      setOpenaiApiKey: (apiKey: string) => set({ openaiApiKey: apiKey }),
      setOpenaiModelId: (modelId: string) => set({ openaiModelId: modelId }),
      setOpenaiApiEndpoint: (endpoint: string) => set({ openaiApiEndpoint: endpoint }),
      setGeminiApiKey: (apiKey: string) => set({ geminiApiKey: apiKey }),
      setGeminiModelId: (modelId: string) => set({ geminiModelId: modelId }),
      setAnthropicApiKey: (apiKey: string) => set({ anthropicApiKey: apiKey }),
      setAnthropicModelId: (modelId: string) => set({ anthropicModelId: modelId }),
      setAnthropicApiEndpoint: (endpoint: string) => set({ anthropicApiEndpoint: endpoint }),
      addCustomProvider: (provider) => {
        const id = generateUUID();
        set((state) => ({
          customProviders: [...state.customProviders, { ...provider, id }],
        }));
        return id;
      },
      updateCustomProvider: (id, patch) =>
        set((state) => ({
          customProviders: state.customProviders.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),
      removeCustomProvider: (id) =>
        set((state) => {
          const customProviders = state.customProviders.filter(
            (p) => p.id !== id
          );
          // If the removed provider was selected, fall back to the first built-in.
          const selectedModel =
            state.selectedModel === `custom:${id}`
              ? "openai"
              : state.selectedModel;
          return { customProviders, selectedModel };
        }),
      getActiveRequestParams: () => {
        const state = get();
        const sel = state.selectedModel;

        // User-defined custom provider.
        if (sel.startsWith("custom:")) {
          const provider = state.customProviders.find(
            (p) => p.id === sel.slice("custom:".length)
          );
          if (provider) {
            return {
              modelType: provider.protocol,
              apiKey: provider.apiKey,
              model: provider.modelId,
              apiEndpoint: provider.apiEndpoint,
              isCustom: true,
            };
          }
        }

        // Built-in provider.
        const config = AI_MODEL_CONFIGS[sel as AIModelType];
        const apiKey =
          sel === "doubao" ? state.doubaoApiKey
          : sel === "openai" ? state.openaiApiKey
          : sel === "gemini" ? state.geminiApiKey
          : sel === "anthropic" ? state.anthropicApiKey
          : state.deepseekApiKey;
        const modelId =
          sel === "doubao" ? state.doubaoModelId
          : sel === "openai" ? state.openaiModelId
          : sel === "gemini" ? state.geminiModelId
          : sel === "anthropic" ? state.anthropicModelId
          : state.deepseekModelId;
        const apiEndpoint =
          sel === "openai" ? state.openaiApiEndpoint
          : sel === "anthropic" ? state.anthropicApiEndpoint
          : undefined;

        return {
          modelType: sel as AIModelType,
          apiKey,
          model: config?.requiresModelId ? modelId : config?.defaultModel,
          apiEndpoint,
          isCustom: false,
        };
      },
      isConfigured: () => {
        const state = get();
        const sel = state.selectedModel;

        if (sel.startsWith("custom:")) {
          const provider = state.customProviders.find(
            (p) => p.id === sel.slice("custom:".length)
          );
          // apiKey optional for local providers; endpoint + model required.
          return !!(provider && provider.apiEndpoint && provider.modelId);
        }

        const config = AI_MODEL_CONFIGS[sel as AIModelType];
        return config ? config.validate(state) : false;
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
            anthropicApiKey: merge(state.anthropicApiKey, defaults.anthropicApiKey),
            anthropicModelId: merge(state.anthropicModelId, defaults.anthropicModelId),
            anthropicApiEndpoint: merge(state.anthropicApiEndpoint, defaults.anthropicApiEndpoint),
          });

          // Seed custom providers from file/env defaults. GUI-added providers
          // win; server-provided ones are added only if their id isn't present.
          const defaultCustom = Array.isArray(defaults.customProviders)
            ? defaults.customProviders
            : [];
          if (defaultCustom.length > 0) {
            const existing = new Set(get().customProviders.map((p) => p.id));
            const additions = defaultCustom.filter(
              (p: CustomAIProvider) =>
                p &&
                typeof p.id === "string" &&
                !existing.has(p.id)
            );
            if (additions.length > 0) {
              set((s) => ({
                customProviders: [...s.customProviders, ...additions],
              }));
            }
          }
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
