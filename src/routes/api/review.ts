import { createFileRoute } from "@tanstack/react-router";
import { AIModelType } from "@/config/ai";
import { callAIForJSON, handleAIError } from "@/lib/server/aiProvider";

const REVIEW_SYSTEM_PROMPT = `You are an expert resume reviewer and career advisor. Analyze the resume provided by the user and return a comprehensive review as JSON.

Your analysis must cover these categories:
1. **content** - Quality of writing, clarity, impact of descriptions, use of action verbs, quantifiable achievements
2. **ats** - Applicant Tracking System compatibility: proper formatting signals, standard section names, keyword presence
3. **keywords** - Industry-relevant keywords and skills that should be present based on the resume content
4. **formatting** - Consistency, structure, completeness of information (dates, locations, etc.)
5. **completeness** - Missing sections, gaps, areas that need more detail

Return a JSON object with this exact schema:
{
  "overallScore": <number 0-100>,
  "findings": [
    {
      "id": "<unique string like f1, f2, etc.>",
      "category": "content" | "ats" | "keywords" | "formatting" | "completeness",
      "severity": "info" | "warning" | "critical",
      "sectionId": "<section: basic, skills, experience, projects, education, selfEvaluation, or general>",
      "message": "<clear, actionable description of the issue>",
      "originalText": "<exact text from resume that should be improved, if applicable>",
      "suggestedFix": "<improved version of the text, if auto-applicable>",
      "autoApplicable": <true if suggestedFix can be directly applied, false otherwise>
    }
  ]
}

Guidelines:
- Be thorough but practical. Aim for 5-15 findings.
- For "content" findings, prefer autoApplicable=true with a specific rewritten suggestion.
- For "ats" and "keywords", explain what's missing and suggest additions.
- For "formatting", note inconsistencies or missing info.
- Score generously but honestly: 90+ = excellent, 70-89 = good, 50-69 = needs work, <50 = needs significant improvement.
- Respond in the same language as the resume content.`;

export const Route = createFileRoute("/api/review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, content, modelType, apiEndpoint } = body as {
            apiKey: string;
            model: string;
            content: string;
            modelType: AIModelType;
            apiEndpoint?: string;
          };

          const rawText = await callAIForJSON({
            modelType,
            apiKey,
            model,
            apiEndpoint,
            systemPrompt: REVIEW_SYSTEM_PROMPT,
            userContent: content,
            temperature: 0.3,
          });

          // Parse the response - handle potential code fences
          let cleaned = rawText.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
          }

          const parsed = JSON.parse(cleaned);

          return Response.json(parsed);
        } catch (error) {
          return handleAIError(error);
        }
      },
    },
  },
});
