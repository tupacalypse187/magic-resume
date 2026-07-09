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

    // Timeline SectionTitle is rendered by the template wrapper (renderTimelineItem)
    // This is a minimal fallback for basic section
    return (
        <div
            className="text-xl font-bold mb-4"
            style={{
                color: themeColor,
                fontSize: `${globalSettings?.headerSize || 20}px`,
            }}
        >
            {renderTitle}
        </div>
    );
};

export default SectionTitle;
