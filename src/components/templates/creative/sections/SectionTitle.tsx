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
        const section = menuSections.find((s) => s.id === type);
        if (section?.titleOverride) return section.titleOverride;
        const titleKey = getSectionTitleKey(type);
        if (titleKey) return t(titleKey);
        return section?.title;
    }, [menuSections, type, title, t]);

    const themeColor = globalSettings?.themeColor;
    if (!showTitle) return null;

    return (
        <h3
            className="inline-block px-3 py-1 rounded text-white shadow-sm mb-3 font-bold"
            style={{
                fontSize: `${globalSettings?.headerSize || 16}px`,
                backgroundColor: themeColor,
                color: "#ffffff",
                marginBottom: `${globalSettings?.paragraphSpacing}px`,
            }}
        >
            {renderTitle}
        </h3>
    );
};

export default SectionTitle;
