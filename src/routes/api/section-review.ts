import { createFileRoute } from "@tanstack/react-router";
import { AIModelType } from "@/config/ai";
import { callAIForJSON, callAIForStream, handleAIError, streamResponse } from "@/lib/server/aiProvider";

const SECTION_REVIEW_PROMPT = `You are an expert resume reviewer. Analyze the provided resume section and return findings as JSON.

Return a JSON object with this schema:
{
  "findings": [
    {
      "id": "<unique id like s1, s2>",
      "category": "content" | "keywords" | "formatting" | "completeness",
      "severity": "info" | "warning" | "critical",
      "sectionId": "<the section id>",
      "message": "<clear actionable description>",
      "originalText": "<exact text that should be improved>",
      "suggestedFix": "<improved version>",
      "autoApplicable": <true/false>
    }
  ]
}

Be concise. Return 3-8 findings max. Respond in the same language as the content.`;

const ADD_KEYWORDS_PROMPT = `You are an expert resume keyword optimizer. Given the resume section content, suggest relevant industry keywords and skills that should be added.

Return JSON:
{
  "keywords": ["keyword1", "keyword2", ...],
  "suggestedAdditions": "A brief paragraph suggesting how to integrate these keywords"
}

Respond in the same language as the content.`;

export const Route = createFileRoute("/api/section-review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, modelType, apiEndpoint, sectionId, sectionContent, action } = body as {
            apiKey: string;
            model: string;
            modelType: AIModelType;
            apiEndpoint?: string;
            sectionId: string;
            sectionContent: string;
            action: "review" | "addKeywords";
          };

          if (action === "addKeywords") {
            const rawText = await callAIForJSON({
              modelType, apiKey, model, apiEndpoint,
              systemPrompt: ADD_KEYWORDS_PROMPT,
              userContent: sectionContent,
              temperature: 0.3,
            });

            let cleaned = rawText.trim();
            if (cleaned.startsWith("```")) {
              cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
            }
            return Response.json(JSON.parse(cleaned));
          }

          // Default: review action
          const rawText = await callAIForJSON({
            modelType, apiKey, model, apiEndpoint,
            systemPrompt: SECTION_REVIEW_PROMPT,
            userContent: `Section: ${sectionId}\n\nContent:\n${sectionContent}`,
            temperature: 0.3,
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
