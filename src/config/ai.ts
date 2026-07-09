export type AIModelType = "doubao" | "deepseek" | "openai" | "gemini" | "anthropic";

/**
 * Protocol a user-defined custom provider speaks. Most 3rd-party/local LLM
 * servers (Ollama, vLLM, Groq, Together, OpenRouter, Alibaba Model Studio)
 * expose an OpenAI-compatible Chat Completions endpoint; some (e.g. ZAI GLM
 * Coding Plan) expose an Anthropic Messages endpoint. The dispatch reuses the
 * matching built-in branch with the user's custom endpoint/key/model.
 */
export type CustomProviderProtocol = "openai" | "anthropic";

export interface CustomAIProvider {
  id: string;
  name: string;
  /** Icon key: a built-in id ("openai"|"anthropic"|"gemini"|"deepseek"|"doubao") or "emoji:<char>". */
  icon: string;
  protocol: CustomProviderProtocol;
  apiEndpoint: string;
  apiKey: string;
  modelId: string;
}

/**
 * Quick-start templates for the "Add Custom Provider" form. Endpoints are
 * best-known defaults; the user still confirms/edits key + model.
 */
export const CUSTOM_PROVIDER_PRESETS: Array<{
  key: string;
  name: string;
  protocol: CustomProviderProtocol;
  apiEndpoint: string;
  icon: string;
  modelHint: string;
}> = [
  {
    key: "zai-glm",
    name: "ZAI GLM Coding Plan",
    protocol: "anthropic",
    apiEndpoint: "https://open.bigmodel.cn/api/anthropic",
    icon: "emoji:🧠",
    modelHint: "glm-5.2",
  },
  {
    key: "alibaba",
    name: "Alibaba Model Studio",
    protocol: "openai",
    apiEndpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    icon: "emoji:🐉",
    modelHint: "qwen3.7-plus",
  },
  {
    key: "ollama",
    name: "Ollama (local)",
    protocol: "openai",
    apiEndpoint: "http://localhost:11434/v1",
    icon: "emoji:🦙",
    modelHint: "llama3",
  },
  {
    key: "blank",
    name: "Blank (custom)",
    protocol: "openai",
    apiEndpoint: "",
    icon: "emoji:⚙️",
    modelHint: "",
  },
];

export interface AIValidationContext {
  doubaoApiKey?: string;
  doubaoModelId?: string;
  deepseekApiKey?: string;
  deepseekModelId?: string;
  openaiApiKey?: string;
  openaiModelId?: string;
  openaiApiEndpoint?: string;
  geminiApiKey?: string;
  geminiModelId?: string;
  anthropicApiKey?: string;
  anthropicModelId?: string;
  anthropicApiEndpoint?: string;
}

export interface AIModelConfig {
  url: (endpoint?: string) => string;
  requiresModelId: boolean;
  defaultModel?: string;
  headers: (apiKey: string) => Record<string, string>;
  validate: (context: AIValidationContext) => boolean;
}

export const AI_MODEL_CONFIGS: Record<AIModelType, AIModelConfig> = {
  doubao: {
    url: () => "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (context: AIValidationContext) => !!(context.doubaoApiKey && context.doubaoModelId),
  },
  deepseek: {
    url: () => "https://api.deepseek.com/v1/chat/completions",
    requiresModelId: false,
    defaultModel: "deepseek-chat",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (context: AIValidationContext) => !!context.deepseekApiKey,
  },
  openai: {
    url: (endpoint?: string) => `${(endpoint || "").trim().replace(/\/+$/, "")}/chat/completions`,
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (context: AIValidationContext) => !!(context.openaiApiKey && context.openaiModelId && context.openaiApiEndpoint),
  },
  gemini: {
    url: () => "https://generativelanguage.googleapis.com/v1beta",
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    }),
    validate: (context: AIValidationContext) => !!(context.geminiApiKey && context.geminiModelId),
  },
  anthropic: {
    url: (endpoint?: string) => {
      const base = (endpoint || "").trim().replace(/\/+$/, "") || "https://api.anthropic.com";
      return `${base}/v1/messages`;
    },
    requiresModelId: true,
    defaultModel: "claude-sonnet-4-6",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    validate: (context: AIValidationContext) => !!(context.anthropicApiKey && context.anthropicModelId),
  },
};
