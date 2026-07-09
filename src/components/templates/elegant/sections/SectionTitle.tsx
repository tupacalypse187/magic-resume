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
        <div className="flex items-center justify-center w-full mb-4 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t" style={{ borderColor: themeColor, opacity: 0.3 }} />
            </div>
            <h3
                className="relative bg-white px-4 text-center font-bold"
                style={{
                    fontSize: `${globalSettings?.headerSize || 20}px`,
                    color: themeColor,
                }}
            >
                {renderTitle}
            </h3>
        </div>
    );
};

export default SectionTitle;
