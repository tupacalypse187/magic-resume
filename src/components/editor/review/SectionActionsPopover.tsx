"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/compat/client";
import { useAIConfiguration } from "@/hooks/useAIConfiguration";
import { useResumeStore } from "@/store/useResumeStore";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { useReviewStore } from "@/store/useReviewStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { extractSectionContent } from "@/utils/sectionExtractor";
import { ReviewFinding } from "@/types/review";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Wand2, RefreshCw, Hash, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SectionActionsPopoverProps {
  sectionId: string;
}

export function SectionActionsPopover({ sectionId }: SectionActionsPopoverProps) {
  const t = useTranslations("sectionReview");
  const { checkConfiguration } = useAIConfiguration();
  const { activeResume } = useResumeStore();
  const [loading, setLoading] = useState(false);

  const getAIParams = () => {
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

    return {
      apiKey,
      model: config.requiresModelId ? modelId : config.defaultModel,
      modelType: selectedModel,
      apiEndpoint: endpoint,
    };
  };

  const handleAction = async (action: "review" | "addKeywords") => {
    if (!checkConfiguration() || !activeResume) return;

    const sectionContent = extractSectionContent(activeResume, sectionId);
    if (!sectionContent.trim()) {
      toast.error(t("noContent"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/section-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...getAIParams(),
          sectionId,
          sectionContent,
          action,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      if (action === "review" && data.findings) {
        useReviewStore.getState().setFindings(data.findings, 0);
        document.dispatchEvent(new CustomEvent("open-review-drawer"));
      }

      if (action === "addKeywords" && data.keywords) {
        const keywordsText = data.keywords.join(", ");
        toast.success(data.suggestedAdditions || keywordsText, {
          duration: 8000,
        });
      }
    } catch (error) {
      toast.error("Failed to analyze section");
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { key: "review", icon: Search, action: "review" as const, label: t("review") },
    { key: "improve", icon: Wand2, action: "review" as const, label: t("improve") },
    { key: "rephrase", icon: RefreshCw, action: "review" as const, label: t("rephrase") },
    { key: "keywords", icon: Hash, action: "addKeywords" as const, label: t("addKeywords") },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        {actions.map(({ key, icon: Icon, action, label }) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8 text-xs"
            onClick={() => handleAction(action)}
            disabled={loading}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
