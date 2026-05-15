import { useMemo } from "react";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";
import { useResumeStore } from "@/store/useResumeStore";
import { useTranslations } from "@/i18n/compat/client";
import { getSectionTitleKey } from "@/utils/sectionTitles";

interface SectionTitleProps {
    globalSettings?: GlobalSettings;
    type: string;
    title?: string;
    showTitle?: boolean;
}

const SectionTitle = ({ type, title, globalSettings, showTitle = true }: SectionTitleProps) => {
    const { activeResume } = useResumeStore();
    const templateContext = useTemplateContext();
    const menuSections = templateContext?.menuSections ?? activeResume?.menuSections ?? [];
    const t = useTranslations();

    const renderTitle = useMemo(() => {
        if (type === "custom") return title;
        const titleKey = getSectionTitleKey(type);
        if (titleKey) return t(titleKey);
        return menuSections.find((s) => s.id === type)?.title;
    }, [menuSections, type, title, t]);

    const themeColor = globalSettings?.themeColor;

    if (!showTitle) return null;

    return (
        <h3
            className="pb-2 border-b font-bold"
            style={{
                fontSize: `${globalSettings?.headerSize || 18}px`,
                color: themeColor,
                borderColor: themeColor,
                marginBottom: `${globalSettings?.paragraphSpacing}px`,
            }}
        >
            {renderTitle}
        </h3>
    );
};

export default SectionTitle;
