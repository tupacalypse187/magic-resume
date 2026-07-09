import { createFileRoute } from "@tanstack/react-router";
import { AIModelType } from "@/config/ai";
import { callAIForJSON, handleAIError } from "@/lib/server/aiProvider";

const MARKDOWN_IMPORT_SYSTEM_PROMPT = `You are a resume parser. The user provides a resume written in Markdown. Extract its contents into a structured JSON object that exactly matches this schema:

{
  "title": "<resume title, usually the person's name or a short label>",
  "basic": {
    "name": "<full name>",
    "title": "<professional headline / target role>",
    "email": "<email address>",
    "phone": "<phone number>",
    "location": "<city, state/country>",
    "employementStatus": "<optional job-seeking status if present>",
    "birthDate": "<optional date of birth if present>"
  },
  "experience": [
    {
      "company": "<company name>",
      "position": "<job title / role>",
      "date": "<date range as written, e.g. Jan 2020 - Present>",
      "details": "<array of bullet points describing achievements/responsibilities>"
    }
  ],
  "education": [
    {
      "school": "<institution>",
      "major": "<major / field of study>",
      "degree": "<degree type, e.g. B.S., M.S.>",
      "startDate": "<start year>",
      "endDate": "<end year or graduation year>",
      "gpa": "<GPA if present>",
      "description": "<optional array of notes>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "role": "<your role>",
      "date": "<date>",
      "description": "<array of bullet points>",
      "link": "<URL if present>",
      "linkLabel": "<display text for the link>"
    }
  ],
  "skillContent": "<array of skill strings, or a single string of skill categories>"
}

Rules:
- Only include arrays/fields that are actually present in the resume. Omit empty sections.
- Put each bullet point of a job/education/project into the corresponding "details"/"description" array as a separate string, stripped of markdown bullets (*, -, leading numbers).
- Normalize headers freely: "PROFESSIONAL SUMMARY", "ABOUT", etc. are not modeled — fold a summary into the first experience details only if relevant; otherwise omit it.
- "TECHNICAL EXPERTISE" / "SKILLS" / "TECHNOLOGIES" sections map to "skillContent".
- "LEADERSHIP" / "CERTIFICATIONS" / community sections: map certifications into education or projects only if they clearly fit; otherwise omit. Prefer accuracy over inclusion.
- Keep dates and text as written; do not invent information.
- Respond with ONLY the JSON object, no prose, no code fences.`;

export const Route = createFileRoute("/api/markdown-import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            apiKey,
            model,
            content,
            modelType,
            apiEndpoint,
            isCustom,
          } = body as {
            apiKey: string;
            model: string;
            content: string;
            modelType: AIModelType;
            apiEndpoint?: string;
            isCustom?: boolean;
          };

          if (!content || !content.trim()) {
            return Response.json(
              { error: "Markdown content is required." },
              { status: 400 }
            );
          }

          const rawText = await callAIForJSON({
            modelType,
            apiKey,
            model,
            apiEndpoint,
            isCustom,
            systemPrompt: MARKDOWN_IMPORT_SYSTEM_PROMPT,
            userContent: content,
            temperature: 0.1,
          });

          // Strip any code fences the model may have added despite instructions.
          let cleaned = rawText.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned
              .replace(/^```(?:json)?\s*\n?/, "")
              .replace(/\n?```\s*$/, "");
          }

          const parsed = JSON.parse(cleaned);
          return Response.json({ resume: parsed });
        } catch (error) {
          return handleAIError(error);
        }
      },
    },
  },
});
