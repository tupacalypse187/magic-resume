import { Bot, Sparkles } from "lucide-react";
import IconOpenAi from "./IconOpenAi";
import IconDeepseek from "./IconDeepseek";
import IconDoubao from "./IconDoubao";
import { cn } from "@/lib/utils";

/**
 * Icon keys for built-in providers. Custom providers may use one of these or an
 * `emoji:<char>` key for a fully custom glyph.
 */
export const BUILTIN_ICON_KEYS = [
  "openai",
  "anthropic",
  "gemini",
  "deepseek",
  "doubao",
] as const;

/** Emoji choices offered in the icon picker for "fully custom" providers. */
export const ICON_EMOJI_CHOICES = [
  "🦙", // Ollama
  "🐉", // Qwen / Alibaba
  "🧠", // GLM / ZAI
  "🤖",
  "⚡",
  "🔮",
  "🦉",
  "⚙️",
  "✨",
  "💜",
] as const;

interface IconComponentProps {
  className?: string;
}

/** Render a provider icon from its key (built-in id or `emoji:<char>`). */
export function ProviderIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const props: IconComponentProps = { className };

  switch (icon) {
    case "openai":
      return <IconOpenAi {...props} />;
    case "anthropic":
      return <Bot {...props} />;
    case "gemini":
      return <Sparkles {...props} />;
    case "deepseek":
      return <IconDeepseek {...props} />;
    case "doubao":
      return <IconDoubao {...props} />;
    default:
      // emoji:<char> or any fallback text
      if (icon.startsWith("emoji:")) {
        return (
          <span className={cn("inline-flex items-center justify-center", className)}>
            {icon.slice("emoji:".length)}
          </span>
        );
      }
      return <Sparkles {...props} />;
  }
}

/** Flat list of selectable icons for the picker (built-ins + emojis). */
export const ICON_PICKER_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "openai", label: "OpenAI" },
  { key: "anthropic", label: "Anthropic" },
  { key: "gemini", label: "Gemini" },
  { key: "deepseek", label: "DeepSeek" },
  { key: "doubao", label: "Doubao" },
  ...ICON_EMOJI_CHOICES.map((e) => ({ key: `emoji:${e}`, label: e })),
];
