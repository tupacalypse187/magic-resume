import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Serve the operator-provided AI config defaults: the ai-config.json file
 * mounted at the server working directory, with the CUSTOM_AI_PROVIDERS env
 * var (a JSON array, e.g. from a k8s Secret) merged over its customProviders
 * by id. Ported from the pre-Nitro server.mjs handler; the file is read on
 * every request so mounted updates apply without a restart.
 */
const parseCustomProvidersEnv = (raw: string | undefined) => {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) => p && typeof p === "object" && typeof p.id === "string"
    );
  } catch {
    return [];
  }
};

export const handleAiConfigRequest = (_request: Request): Response => {
  let config: Record<string, unknown> = {};
  const aiConfigPath = resolve(process.cwd(), "ai-config.json");
  if (existsSync(aiConfigPath)) {
    try {
      config = JSON.parse(readFileSync(aiConfigPath, "utf-8")) || {};
    } catch {
      config = {};
    }
  }

  const envProviders = parseCustomProvidersEnv(process.env.CUSTOM_AI_PROVIDERS);
  if (envProviders.length > 0) {
    const byId = new Map(
      (Array.isArray(config.customProviders) ? config.customProviders : []).map(
        (p: { id?: string }) => [p?.id, p]
      )
    );
    for (const p of envProviders) {
      if (p && typeof p.id === "string") byId.set(p.id, { ...byId.get(p.id), ...p });
    }
    config.customProviders = Array.from(byId.values());
  }

  return new Response(JSON.stringify(config), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};
