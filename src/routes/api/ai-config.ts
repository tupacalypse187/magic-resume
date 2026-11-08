import { createFileRoute } from "@tanstack/react-router";
import { handleAiConfigRequest } from "@/lib/server/ai-config";

export const Route = createFileRoute("/api/ai-config")({
  server: { handlers: { GET: ({ request }) => handleAiConfigRequest(request) } },
});
