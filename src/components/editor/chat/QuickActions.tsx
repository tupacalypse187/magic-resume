"use client";

import { useTranslations } from "@/i18n/compat/client";
import { useChatStore } from "@/store/useChatStore";
import { useAIConfiguration } from "@/hooks/useAIConfiguration";
import { Button } from "@/components/ui/button";
import { Star, Briefcase, Hash, FileText } from "lucide-react";

const ACTIONS = [
  { key: "reviewResume", icon: Star, prompt: "Please review my resume and give me a detailed assessment of what's working well and what needs improvement." },
  { key: "improveExperience", icon: Briefcase, prompt: "How can I improve my work experience section? Make the bullet points more impactful with quantifiable achievements." },
  { key: "suggestKeywords", icon: Hash, prompt: "What keywords and skills should I add to my resume to improve ATS compatibility for my target role?" },
  { key: "rewriteSummary", icon: FileText, prompt: "Please help me rewrite my self-evaluation/summary section to be more compelling and professional." },
] as const;

export function QuickActions() {
  const t = useTranslations("aiChat.quickActions");
  const { sendMessage, isStreaming } = useChatStore();
  const { checkConfiguration } = useAIConfiguration();

  const handleClick = async (prompt: string) => {
    if (!checkConfiguration() || isStreaming) return;
    await sendMessage(prompt);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {ACTIONS.map(({ key, icon: Icon, prompt }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-[11px] gap-1.5"
          onClick={() => handleClick(prompt)}
          disabled={isStreaming}
        >
          <Icon className="h-3 w-3" />
          {t(key)}
        </Button>
      ))}
    </div>
  );
}
