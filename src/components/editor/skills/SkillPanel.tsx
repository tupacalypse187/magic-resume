import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import Field from "../Field";
import { useTranslations } from "@/i18n/compat/client";

const SkillPanel = () => {
  const { activeResume, updateSkillContent } = useResumeStore();
  const { skillContent } = activeResume || {};
  const t = useTranslations("workbench.sidePanel.layout");
  const handleChange = (value: string) => {
    updateSkillContent(value);
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        "bg-card",
        "border-border"
      )}
    >
      <Field
        value={skillContent ?? ""}
        onChange={handleChange}
        type="editor"
        placeholder={t("skillPlaceholder")}
      />
    </div>
  );
};

export default SkillPanel;
