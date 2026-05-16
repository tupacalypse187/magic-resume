"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/compat/client";
import { useResumeStore } from "@/store/useResumeStore";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { useAIConfiguration } from "@/hooks/useAIConfiguration";
import { serializeResumeForAI } from "@/utils/resumeSerializer";
import { TemplateSuggestion } from "@/types/review";
import { SettingCard } from "@/components/editor/SettingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function AITemplateSuggestCard() {
  const t = useTranslations("aiTemplate");
  const { activeResume, updateGlobalSettings, setTemplate } = useResumeStore() as any;
  const { checkConfiguration } = useAIConfiguration();
  const [targetRole, setTargetRole] = useState("");
  const [suggestion, setSuggestion] = useState<TemplateSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!checkConfiguration() || !activeResume) return;

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

    setLoading(true);
    setSuggestion(null);

    try {
      const resumeContent = serializeResumeForAI(activeResume);
      const response = await fetch("/api/template-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: config.requiresModelId ? modelId : config.defaultModel,
          modelType: selectedModel,
          apiEndpoint: endpoint,
          resumeContent,
          currentSettings: activeResume.globalSettings || {},
          currentTemplateId: activeResume.templateId || "classic",
          targetRole: targetRole || undefined,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      setSuggestion(data);
    } catch {
      toast.error(t("error.failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyStyle = () => {
    if (!suggestion?.suggestedSettings) return;
    updateGlobalSettings(suggestion.suggestedSettings);
    toast.success(t("applied"));
  };

  const handleTryTemplate = () => {
    if (!suggestion?.suggestedTemplateId) return;
    setTemplate(suggestion.suggestedTemplateId);
    toast.success(t("applied"));
  };

  return (
    <SettingCard icon={Sparkles} title={t("title")}>
      <div className="space-y-3">
        {!suggestion && !loading && (
          <p className="text-xs text-muted-foreground">{t("noSuggestion")}</p>
        )}

        <div className="flex gap-2">
          <Input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder={t("targetRolePlaceholder")}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            className="h-8 px-3"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              t("generate")
            )}
          </Button>
        </div>

        {suggestion && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs text-foreground/80">{suggestion.rationale}</p>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs"
                onClick={handleApplyStyle}
              >
                <Check className="h-3 w-3 mr-1" />
                {t("applyStyle")}
              </Button>

              {suggestion.suggestedTemplateId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={handleTryTemplate}
                >
                  {t("tryTemplate", { templateName: suggestion.suggestedTemplateId })}
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleGenerate}
                disabled={loading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t("regenerate")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </SettingCard>
  );
}
