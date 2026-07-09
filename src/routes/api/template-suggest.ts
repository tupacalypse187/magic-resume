import { createFileRoute } from "@tanstack/react-router";
import { AIModelType } from "@/config/ai";
import { callAIForJSON, handleAIError } from "@/lib/server/aiProvider";

const TEMPLATE_SUGGEST_PROMPT = `You are an expert resume designer and career advisor. Given the resume content and current style settings, suggest optimal style changes.

Available style settings you can modify:
- themeColor: hex color string (e.g., "#1A1A1A")
- fontFamily: string
- baseFontSize: number (8-18)
- headerSize: number (14-28)
- subheaderSize: number (10-20)
- pagePadding: number (20-60)
- paragraphSpacing: number (2-12)
- lineHeight: number (1.2-2.0)
- sectionSpacing: number (8-40)

Available template IDs: classic, modern, left-right, timeline, minimalist, elegant, creative, editorial

Return JSON:
{
  "rationale": "<brief explanation of why these changes improve the resume>",
  "suggestedSettings": {
    "themeColor": "<optional hex>",
    "baseFontSize": <optional number>,
    "headerSize": <optional number>,
    "subheaderSize": <optional number>,
    "pagePadding": <optional number>,
    "paragraphSpacing": <optional number>,
    "lineHeight": <optional number>,
    "sectionSpacing": <optional number>
  },
  "suggestedTemplateId": "<optional template id if a different template would be better>",
  "confidence": "high" | "medium" | "low"
}

Only include settings you want to change. Omit settings that are fine as-is.`;

export const Route = createFileRoute("/api/template-suggest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, modelType, apiEndpoint, isCustom, resumeContent, currentSettings, currentTemplateId, targetRole } = body as {
            apiKey: string;
            model: string;
            modelType: AIModelType;
            apiEndpoint?: string;
            isCustom?: boolean;
            resumeContent: string;
            currentSettings: Record<string, unknown>;
            currentTemplateId: string;
            targetRole?: string;
          };

          const userContent = `Current template: ${currentTemplateId}\nCurrent settings: ${JSON.stringify(currentSettings)}\n${targetRole ? `Target role: ${targetRole}\n` : ""}\nResume content:\n${resumeContent}`;

          const rawText = await callAIForJSON({
            modelType, apiKey, model, apiEndpoint, isCustom,
            systemPrompt: TEMPLATE_SUGGEST_PROMPT,
            userContent,
            temperature: 0.5,
          });

          let cleaned = rawText.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
          }

          return Response.json(JSON.parse(cleaned));
        } catch (error) {
          return handleAIError(error);
        }
      },
    },
  },
});
