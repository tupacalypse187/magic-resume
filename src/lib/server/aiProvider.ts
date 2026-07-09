import { AIModelType, AI_MODEL_CONFIGS } from "@/config/ai";
import { formatGeminiErrorMessage, getGeminiModelInstance } from "@/lib/server/gemini";

export interface AICallParams {
  modelType: AIModelType;
  apiKey: string;
  model: string;
  apiEndpoint?: string;
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  /** True for user-defined custom providers — omits response_format for compatibility. */
  isCustom?: boolean;
}

const parseUpstreamError = (raw: string, fallback: string) => {
  if (!raw) return { message: fallback };
  try {
    const data = JSON.parse(raw) as {
      error?: { message?: string; code?: string };
      message?: string;
    };
    return {
      message: data.error?.message || data.message || fallback,
      code: data.error?.code,
    };
  } catch {
    return { message: raw };
  }
};

export async function callAIForJSON(params: AICallParams): Promise<string> {
  const { modelType, apiKey, model, apiEndpoint, systemPrompt, userContent, temperature = 0, isCustom } = params;
  const modelConfig = AI_MODEL_CONFIGS[modelType];
  if (!modelConfig) throw new Error("Invalid model type");

  if (modelType === "gemini") {
    const geminiModel = model || "gemini-flash-latest";
    const modelInstance = getGeminiModelInstance({
      apiKey,
      model: geminiModel,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
      },
    });
    const result = await modelInstance.generateContent(userContent);
    return result.response.text() || "";
  }

  if (modelType === "anthropic") {
    const response = await fetch(modelConfig.url(apiEndpoint), {
      method: "POST",
      headers: modelConfig.headers(apiKey),
      body: JSON.stringify({
        model: model || modelConfig.defaultModel,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    const raw = await response.text();
    if (!response.ok) {
      const parsed = parseUpstreamError(raw, `Upstream API error: ${response.status}`);
      throw new Error(parsed.message);
    }
    const data = JSON.parse(raw) as { content?: Array<{ type: string; text?: string }> };
    return data.content?.find((b) => b.type === "text")?.text || "";
  }

  const response = await fetch(modelConfig.url(apiEndpoint), {
    method: "POST",
    headers: modelConfig.headers(apiKey),
    body: JSON.stringify({
      model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
      // Some local/3rd-party OpenAI-compatible servers reject response_format;
      // omit it for user-defined custom providers (routes extract JSON anyway).
      ...(isCustom ? {} : { response_format: { type: "json_object" } }),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature,
    }),
  });
  const raw = await response.text();
  if (!response.ok) {
    const parsed = parseUpstreamError(raw, `Upstream API error: ${response.status}`);
    throw new Error(parsed.message);
  }
  try {
    const data = JSON.parse(raw);
    return data.choices?.[0]?.message?.content ?? raw;
  } catch {
    return raw;
  }
}

export async function callAIForStream(params: AICallParams): Promise<ReadableStream> {
  const { modelType, apiKey, model, apiEndpoint, systemPrompt, userContent, temperature = 0.4 } = params;
  const modelConfig = AI_MODEL_CONFIGS[modelType];
  if (!modelConfig) throw new Error("Invalid model type");

  const encoder = new TextEncoder();

  if (modelType === "gemini") {
    const geminiModel = model || "gemini-flash-latest";
    const modelInstance = getGeminiModelInstance({
      apiKey,
      model: geminiModel,
      systemInstruction: systemPrompt,
      generationConfig: { temperature },
    });

    return new ReadableStream({
      async start(controller) {
        try {
          const result = await modelInstance.generateContentStream(userContent);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (error) {
          controller.error(error);
          return;
        }
        controller.close();
      },
    });
  }

  if (modelType === "anthropic") {
    const response = await fetch(modelConfig.url(apiEndpoint), {
      method: "POST",
      headers: modelConfig.headers(apiKey),
      body: JSON.stringify({
        model: model || modelConfig.defaultModel,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const rawError = await response.text();
      const parsed = parseUpstreamError(rawError, `Upstream API error: ${response.status}`);
      throw new Error(parsed.message);
    }

    return new ReadableStream({
      async start(controller) {
        if (!response.body) { controller.close(); return; }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            pending += decoder.decode(value, { stream: true });
            const lines = pending.split(/\r?\n/);
            pending = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload) continue;
              try {
                const data = JSON.parse(payload) as {
                  type?: string;
                  delta?: { text?: string };
                  error?: { message?: string };
                };
                if (data.error?.message) {
                  controller.error(new Error(data.error.message));
                  return;
                }
                if (data.type === "content_block_delta" && data.delta?.text) {
                  controller.enqueue(encoder.encode(data.delta.text));
                }
              } catch {}
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  const response = await fetch(modelConfig.url(apiEndpoint), {
    method: "POST",
    headers: modelConfig.headers(apiKey),
    body: JSON.stringify({
      model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      stream: true,
      temperature,
    }),
  });

  if (!response.ok) {
    const rawError = await response.text();
    const parsed = parseUpstreamError(rawError, `Upstream API error: ${response.status}`);
    throw new Error(parsed.message);
  }

  return new ReadableStream({
    async start(controller) {
      if (!response.body) { controller.close(); return; }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += decoder.decode(value, { stream: true });
          const lines = pending.split(/\r?\n/);
          pending = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            try {
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              const data = JSON.parse(payload) as {
                error?: { message?: string };
                choices?: Array<{ delta?: { content?: string } }>;
              };
              if (data.error?.message) {
                controller.error(new Error(data.error.message));
                return;
              }
              const deltaContent = data.choices?.[0]?.delta?.content;
              if (deltaContent) controller.enqueue(encoder.encode(deltaContent));
            } catch {}
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export function streamResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function handleAIError(error: unknown): Response {
  console.error("AI call error:", error);
  return Response.json(
    { error: formatGeminiErrorMessage(error) },
    { status: 500 }
  );
}
