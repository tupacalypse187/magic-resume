import { createFileRoute } from "@tanstack/react-router";
import { AIModelType } from "@/config/ai";
import { callAIForStream, handleAIError } from "@/lib/server/aiProvider";

const CHAT_SYSTEM_PROMPT = `You are an expert resume advisor and career coach. The user will share their resume with you and ask for help improving it.

Your capabilities:
- Review and critique resume content
- Suggest improvements to specific sections
- Recommend keywords and skills to add
- Help rephrase bullet points for impact
- Provide ATS optimization advice
- Suggest formatting and structure changes
- Help with career strategy and positioning

Guidelines:
- Be specific and actionable in your suggestions
- When suggesting text changes, clearly indicate what should be replaced
- Consider the user's target industry and role (ask if not clear)
- Be encouraging but honest about areas that need improvement
- Use markdown formatting in your responses for clarity
- Keep responses concise and focused`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, modelType, apiEndpoint, resumeContext, messages, newMessage } = body as {
            apiKey: string;
            model: string;
            modelType: AIModelType;
            apiEndpoint?: string;
            resumeContext: string;
            messages: Array<{ role: string; content: string }>;
            newMessage: string;
          };

          // Build the system prompt with resume context
          const systemPrompt = `${CHAT_SYSTEM_PROMPT}\n\nHere is the user's current resume:\n\n${resumeContext}`;

          // Build conversation as a single user content string for providers that don't support multi-turn
          // For chat, we use the conversation history approach
          const conversationHistory = messages
            .slice(-10) // Keep last 10 messages for context
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n\n");

          const userContent = conversationHistory
            ? `${conversationHistory}\n\nUser: ${newMessage}`
            : newMessage;

          const stream = await callAIForStream({
            modelType,
            apiKey,
            model,
            apiEndpoint,
            systemPrompt,
            userContent,
            temperature: 0.7,
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (error) {
          return handleAIError(error);
        }
      },
    },
  },
});
