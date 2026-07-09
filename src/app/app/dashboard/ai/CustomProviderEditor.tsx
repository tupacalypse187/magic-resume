import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "@/i18n/compat/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CUSTOM_PROVIDER_PRESETS,
  CustomAIProvider,
  CustomProviderProtocol,
} from "@/config/ai";
import {
  ProviderIcon,
  ICON_PICKER_OPTIONS,
} from "@/components/ai/icon/registry";

interface CustomProviderEditorProps {
  provider?: CustomAIProvider;
  onSave: (values: Omit<CustomAIProvider, "id">) => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

export const CustomProviderEditor = ({
  provider,
  onSave,
  onCancel,
  onDelete,
}: CustomProviderEditorProps) => {
  const t = useTranslations("dashboard.settings.ai.custom");
  const [name, setName] = useState(provider?.name ?? "");
  const [icon, setIcon] = useState(provider?.icon ?? "emoji:⚙️");
  const [protocol, setProtocol] = useState<CustomProviderProtocol>(
    provider?.protocol ?? "openai"
  );
  const [apiEndpoint, setApiEndpoint] = useState(provider?.apiEndpoint ?? "");
  const [apiKey, setApiKey] = useState(provider?.apiKey ?? "");
  const [modelId, setModelId] = useState(provider?.modelId ?? "");
  const [customEmoji, setCustomEmoji] = useState("");

  useEffect(() => {
    if (provider) {
      setName(provider.name);
      setIcon(provider.icon);
      setProtocol(provider.protocol);
      setApiEndpoint(provider.apiEndpoint);
      setApiKey(provider.apiKey);
      setModelId(provider.modelId);
    }
  }, [provider]);

  const applyPreset = (presetKey: string) => {
    const preset = CUSTOM_PROVIDER_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    setName(preset.name);
    setIcon(preset.icon);
    setProtocol(preset.protocol);
    setApiEndpoint(preset.apiEndpoint);
    setModelId(preset.modelHint);
  };

  const canSave = name.trim() && apiEndpoint.trim() && modelId.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), icon, protocol, apiEndpoint: apiEndpoint.trim(), apiKey, modelId: modelId.trim() });
  };

  return (
    <div className="space-y-6">
      {/* Preset quick-start (only when adding) */}
      {!provider && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("preset")}</Label>
          <div className="flex flex-wrap gap-2">
            {CUSTOM_PROVIDER_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset.key)}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent/50 transition-colors"
              >
                <ProviderIcon icon={preset.icon} className="h-3.5 w-3.5" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name + icon */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("name")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} className="h-11" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("icon")}</Label>
          <div className="flex flex-wrap gap-1.5">
            {ICON_PICKER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setIcon(opt.key)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                  icon === opt.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent/50"
                )}
                title={opt.label}
              >
                <ProviderIcon icon={opt.key} className="h-5 w-5" />
              </button>
            ))}
          </div>
          {/* Custom emoji entry */}
          <div className="flex items-center gap-2 mt-2">
            <Input
              value={customEmoji}
              onChange={(e) => {
                const v = e.target.value;
                setCustomEmoji(v);
                if (v.trim()) setIcon(`emoji:${v.trim()}`);
              }}
              placeholder={t("customEmojiPlaceholder")}
              className="h-9 w-32"
            />
            <span className="text-xs text-muted-foreground">{t("customEmojiHint")}</span>
          </div>
        </div>
      </div>

      {/* Protocol */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("protocol")}</Label>
        <div className="flex rounded-md border overflow-hidden w-fit">
          {(["openai", "anthropic"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProtocol(p)}
              className={cn(
                "px-4 py-1.5 text-sm transition-colors",
                protocol === p
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent/50"
              )}
            >
              {p === "openai" ? "OpenAI" : "Anthropic"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {protocol === "openai" ? t("protocolOpenaiHint") : t("protocolAnthropicHint")}
        </p>
      </div>

      {/* Endpoint */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("apiEndpoint")}</Label>
        <Input
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
          placeholder={protocol === "anthropic" ? "https://open.bigmodel.cn/api/anthropic" : "http://localhost:11434/v1"}
          className="h-11"
        />
      </div>

      {/* API key */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("apiKey")}</Label>
        <Input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type="password"
          placeholder={t("apiKeyPlaceholder")}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">{t("apiKeyHint")}</p>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("modelId")}</Label>
        <Input
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          placeholder="glm-5.2 / qwen3.7-plus / llama3"
          className="h-11"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button type="button" onClick={handleSave} disabled={!canSave}>
          {provider ? t("save") : t("add")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
        )}
        {provider && onDelete && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(provider.id)}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {t("delete")}
          </Button>
        )}
      </div>
    </div>
  );
};
