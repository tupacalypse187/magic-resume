import { useEffect, useState } from "react";
import { Check, ExternalLink, Sparkles, Bot, Plus } from "lucide-react";
import { useTranslations } from "@/i18n/compat/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DeepSeekLogo from "@/components/ai/icon/IconDeepseek";
import IconDoubao from "@/components/ai/icon/IconDoubao";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { cn } from "@/lib/utils";
import IconOpenAi from "@/components/ai/icon/IconOpenAi";
import { CustomAIProvider } from "@/config/ai";
import { ProviderIcon } from "@/components/ai/icon/registry";
import { CustomProviderEditor } from "./CustomProviderEditor";

const AISettingsPage = () => {
  const {
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
    geminiApiKey,
    geminiModelId,
    anthropicApiKey,
    anthropicModelId,
    anthropicApiEndpoint,
    setDoubaoApiKey,
    setDoubaoModelId,
    setDeepseekApiKey,
    setOpenaiApiKey,
    setOpenaiModelId,
    setOpenaiApiEndpoint,
    setGeminiApiKey,
    setGeminiModelId,
    setAnthropicApiKey,
    setAnthropicModelId,
    setAnthropicApiEndpoint,
    selectedModel,
    setSelectedModel,
    customProviders,
    addCustomProvider,
    updateCustomProvider,
    removeCustomProvider,
  } = useAIConfigStore();
  const [currentModel, setCurrentModel] = useState(selectedModel);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);

  const t = useTranslations();

  useEffect(() => {
    setCurrentModel(selectedModel);
  }, [selectedModel]);

  const handleApiKeyChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "doubao" | "deepseek" | "openai" | "gemini" | "anthropic"
  ) => {
    const newApiKey = e.target.value;
    if (type === "doubao") {
      setDoubaoApiKey(newApiKey);
    } else if (type === "deepseek") {
      setDeepseekApiKey(newApiKey);
    } else if (type === "gemini") {
      setGeminiApiKey(newApiKey);
    } else if (type === "anthropic") {
      setAnthropicApiKey(newApiKey);
    } else {
      setOpenaiApiKey(newApiKey);
    }
  };

  const handleModelIdChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "doubao" | "openai" | "gemini" | "anthropic"
  ) => {
    const newModelId = e.target.value;
    if (type === "doubao") {
      setDoubaoModelId(newModelId);
    } else if (type === "openai") {
      setOpenaiModelId(newModelId);
    } else if (type === "gemini") {
      setGeminiModelId(newModelId);
    } else if (type === "anthropic") {
      setAnthropicModelId(newModelId);
    }
  };

  const handleApiEndpointChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "openai" | "anthropic"
  ) => {
    const newApiEndpoint = e.target.value;
    if (type === "openai") {
      setOpenaiApiEndpoint(newApiEndpoint);
    } else if (type === "anthropic") {
      setAnthropicApiEndpoint(newApiEndpoint);
    }
  };

  const models = [
    {
      id: "anthropic",
      name: t("dashboard.settings.ai.anthropic.title"),
      description: t("dashboard.settings.ai.anthropic.description"),
      icon: Bot,
      link: "https://console.anthropic.com/settings/keys",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      isConfigured: !!(anthropicApiKey && anthropicModelId),
    },
    {
      id: "deepseek",
      name: t("dashboard.settings.ai.deepseek.title"),
      description: t("dashboard.settings.ai.deepseek.description"),
      icon: DeepSeekLogo,
      link: "https://platform.deepseek.com",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      isConfigured: !!deepseekApiKey,
    },
    {
      id: "openai",
      name: t("dashboard.settings.ai.openai.title"),
      description: t("dashboard.settings.ai.openai.description"),
      icon: IconOpenAi,
      link: "https://platform.openai.com/api-keys",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      isConfigured: !!(openaiApiKey && openaiModelId && openaiApiEndpoint),
    },
    {
      id: "gemini",
      name: t("dashboard.settings.ai.gemini.title"),
      description: t("dashboard.settings.ai.gemini.description"),
      icon: Sparkles,
      link: "https://aistudio.google.com/app/apikey",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      isConfigured: !!(geminiApiKey && geminiModelId),
    },
    {
      id: "doubao",
      name: t("dashboard.settings.ai.doubao.title"),
      description: t("dashboard.settings.ai.doubao.description"),
      icon: IconDoubao,
      link: "https://console.volcengine.com/ark",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      isConfigured: !!(doubaoApiKey && doubaoModelId),
    },
  ];

  return (
    <div className="mx-auto py-4 px-4">
      <div className="flex gap-8">
        <div className="w-64 space-y-6">
          <div className="flex flex-col space-y-1">
            {models.map((model) => {
              const Icon = model.icon;
              const isChecked = selectedModel === model.id;
              const isViewing = currentModel === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => {
                    setCurrentModel(model.id as typeof currentModel);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left border",
                    "transition-all duration-200 cursor-pointer",
                    "hover:bg-primary/10 hover:border-primary/30",
                    isViewing
                      ? "bg-primary/10 border-primary/40"
                      : "border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0",
                      isViewing ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-start">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isViewing && "text-primary"
                      )}
                    >
                      {model.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {model.isConfigured
                        ? t("common.configured")
                        : t("common.notConfigured")}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Select ${model.name}`}
                    onClick={() => {
                      setSelectedModel(
                        model.id as "doubao" | "deepseek" | "openai" | "gemini" | "anthropic"
                      );
                      setCurrentModel(
                        model.id as "doubao" | "deepseek" | "openai" | "gemini" | "anthropic"
                      );
                    }}
                    className={cn(
                      "h-6 w-6 rounded-md flex items-center justify-center border transition-all",
                      "shrink-0",
                      isChecked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-transparent border-muted-foreground/40 text-transparent hover:border-primary/40"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {customProviders.length > 0 && (
              <div className="h-px bg-border my-2" />
            )}

            {customProviders.map((provider) => {
              const providerKey = `custom:${provider.id}` as typeof currentModel;
              const isChecked = selectedModel === providerKey;
              const isViewing = currentModel === providerKey;
              const isConfigured = !!(provider.apiEndpoint && provider.modelId);
              return (
                <div
                  key={provider.id}
                  onClick={() => setCurrentModel(providerKey)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left border",
                    "transition-all duration-200 cursor-pointer",
                    "hover:bg-primary/10 hover:border-primary/30",
                    isViewing ? "bg-primary/10 border-primary/40" : "border-transparent"
                  )}
                >
                  <div className={cn("shrink-0", isViewing ? "text-primary" : "text-muted-foreground")}>
                    <ProviderIcon icon={provider.icon} className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-start">
                    <span className={cn("font-medium text-sm truncate w-full", isViewing && "text-primary")}>
                      {provider.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {isConfigured ? t("common.configured") : t("common.notConfigured")}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Select ${provider.name}`}
                    onClick={() => {
                      setSelectedModel(providerKey);
                      setCurrentModel(providerKey);
                    }}
                    className={cn(
                      "h-6 w-6 rounded-md flex items-center justify-center border transition-all shrink-0",
                      isChecked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-transparent border-muted-foreground/40 text-transparent hover:border-primary/40"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setIsAddCustomOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-1 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("dashboard.settings.ai.custom.addProvider")}
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          {typeof currentModel === "string" && currentModel.startsWith("custom:") &&
            (() => {
              const provider = customProviders.find(
                (p) => p.id === currentModel.slice("custom:".length)
              );
              if (!provider) return null;
              return (
                <div key={provider.id} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <div className="shrink-0 text-primary">
                        <ProviderIcon icon={provider.icon} className="h-6 w-6" />
                      </div>
                      {provider.name}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      {t("dashboard.settings.ai.custom.description")}
                    </p>
                  </div>
                  <CustomProviderEditor
                    provider={provider}
                    onSave={(values) => updateCustomProvider(provider.id, values)}
                    onDelete={(id) => {
                      removeCustomProvider(id);
                      setCurrentModel("openai");
                    }}
                  />
                </div>
              );
            })()}

          {models.map(
            (model) =>
              model.id === currentModel && (
                <div key={model.id} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <div className={cn("shrink-0", model.color)}>
                        <model.icon className="h-6 w-6" />
                      </div>
                      {model.name}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      {model.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          {t(`dashboard.settings.ai.${model.id}.apiKey`)}
                        </Label>
                        <a
                          href={model.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          {t("dashboard.settings.ai.getApiKey")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <Input
                        value={
                          model.id === "doubao"
                            ? doubaoApiKey
                            : model.id === "openai"
                            ? openaiApiKey
                            : model.id === "gemini"
                            ? geminiApiKey
                            : model.id === "anthropic"
                            ? anthropicApiKey
                            : deepseekApiKey
                        }
                        onChange={(e) =>
                          handleApiKeyChange(
                            e,
                            model.id as "doubao" | "deepseek" | "openai" | "gemini" | "anthropic"
                          )
                        }
                        type="password"
                        placeholder={t(
                          `dashboard.settings.ai.${model.id}.apiKey`
                        )}
                        className={cn(
                          "h-11",
                          "bg-white dark:bg-gray-900",
                          "border-gray-200 dark:border-gray-800",
                          "focus:ring-2 focus:ring-primary/20"
                        )}
                      />
                    </div>

                    {model.id === "doubao" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.doubao.modelId")}
                        </Label>
                        <Input
                          value={doubaoModelId}
                          onChange={(e) => handleModelIdChange(e, "doubao")}
                          placeholder={t(
                            "dashboard.settings.ai.doubao.modelId"
                          )}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}

                    {model.id === "openai" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.openai.modelId")}
                        </Label>
                        <Input
                          value={openaiModelId}
                          onChange={(e) => handleModelIdChange(e, "openai")}
                          placeholder={t(
                            "dashboard.settings.ai.openai.modelId"
                          )}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}

                    {model.id === "gemini" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.gemini.modelId")}
                        </Label>
                        <Input
                          value={geminiModelId}
                          onChange={(e) => handleModelIdChange(e, "gemini")}
                          placeholder={t("dashboard.settings.ai.gemini.modelId")}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}

                    {model.id === "anthropic" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.anthropic.modelId")}
                        </Label>
                        <Input
                          value={anthropicModelId}
                          onChange={(e) => handleModelIdChange(e, "anthropic")}
                          placeholder="claude-sonnet-4-6"
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}

                    {model.id === "openai" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.openai.apiEndpoint")}
                        </Label>
                        <Input
                          value={openaiApiEndpoint}
                          onChange={(e) => handleApiEndpointChange(e, "openai")}
                          placeholder={t(
                            "dashboard.settings.ai.openai.apiEndpoint"
                          )}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}

                    {model.id === "anthropic" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.anthropic.apiEndpoint")}
                        </Label>
                        <Input
                          value={anthropicApiEndpoint}
                          onChange={(e) => handleApiEndpointChange(e, "anthropic")}
                          placeholder="https://api.anthropic.com"
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      <Dialog open={isAddCustomOpen} onOpenChange={setIsAddCustomOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dashboard.settings.ai.custom.addTitle")}</DialogTitle>
          </DialogHeader>
          <CustomProviderEditor
            onSave={(values) => {
              const id = addCustomProvider(values);
              setSelectedModel(`custom:${id}` as typeof selectedModel);
              setCurrentModel(`custom:${id}` as typeof currentModel);
              setIsAddCustomOpen(false);
            }}
            onCancel={() => setIsAddCustomOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
export const runtime = "edge";

export default AISettingsPage;
