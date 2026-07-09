import React from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/compat/client";
import { getSectionTitleKey } from "@/utils/sectionTitles";
import BasicPanel from "./basic/BasicPanel";
import EducationPanel from "./education/EducationPanel";
import ProjectPanel from "./project/ProjectPanel";
import ExperiencePanel from "./experience/ExperiencePanel";
import CustomPanel from "./custom/CustomPanel";
import SkillPanel from "./skills/SkillPanel";
import SelfEvaluationPanel from "./self-evaluation/SelfEvaluationPanel";
import CertificatesPanel from "./certificates/CertificatesPanel";
import { SectionActionsPopover } from "./review/SectionActionsPopover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function EditPanel() {
  const { activeResume, updateMenuSections } = useResumeStore();
  const t = useTranslations();
  if (!activeResume) return;
  const { activeSection = "", menuSections = [] } = activeResume || {};

  const activeSectionData = menuSections?.find((s) => s.id === activeSection);
  const sectionTitleKey = activeSectionData ? getSectionTitleKey(activeSectionData.id) : null;
  const defaultTitle = sectionTitleKey ? t(sectionTitleKey) : activeSectionData?.title;
  // A user-set override (per-resume) wins over the translated default for standard sections.
  const displayTitle = activeSectionData?.titleOverride || defaultTitle;

  const updateSectionField = (patch: Partial<typeof activeSectionData>) => {
    if (!activeSectionData) return;
    updateMenuSections(
      menuSections.map((s) =>
        s.id === activeSection ? { ...s, ...patch } : s
      )
    );
  };

  const renderFields = () => {
    switch (activeSection) {
      case "basic":
        return <BasicPanel />;

      case "projects":
        return <ProjectPanel />;
      case "education":
        return <EducationPanel />;
      case "experience":
        return <ExperiencePanel />;
      case "skills":
        return <SkillPanel />;
      case "selfEvaluation":
        return <SelfEvaluationPanel />;
      case "certificates":
        return <CertificatesPanel />;
      default:
        if (activeSection?.startsWith("custom")) {
          return <CustomPanel sectionId={activeSection} />;
        } else {
          return <BasicPanel />;
        }
    }
  };

  return (
    <motion.div
      className={cn(
        "w-full h-full border-r overflow-y-auto",
        "bg-background border-border"
      )}
    >
      <div className="p-4">
        <motion.div
          className={cn(
            "mb-4 p-4 rounded-lg border",
            "bg-card border-border"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {menuSections?.find((s) => s.id === activeSection)?.icon}
            </span>
            <div className="flex-1 flex items-center gap-1">

            {/* 如果是基本信息的展示话展示div */}
            {activeSection === "basic" ? (
              <span className="text-lg font-semibold text-primary">
                {displayTitle}
              </span>
            ) : (
              <>
                {sectionTitleKey ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      className={cn(
                        "flex-1 text-lg font-semibold text-primary bg-transparent outline-none pb-1 min-w-0",
                        "placeholder:text-muted-foreground/50"
                      )}
                      type="text"
                      value={activeSectionData?.titleOverride ?? ""}
                      placeholder={defaultTitle}
                      onChange={(e) =>
                        updateSectionField({ titleOverride: e.target.value })
                      }
                    />
                    {activeSectionData?.titleOverride && (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => updateSectionField({ titleOverride: undefined })}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <RotateCcw size={15} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("workbench.editor.resetToDefault")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ) : (
                <input
                  className={cn(
                    "flex-1 text-lg  font-medium  text-primary border-black  bg-transparent outline-none   pb-1 text-primary"
                  )}
                  type="text"
                  value={activeSectionData?.title || ""}
                  onChange={(e) => {
                    const newMenuSections = menuSections.map((s) => {
                      if (s.id === activeSection) {
                        return {
                          ...s,
                          title: e.target.value,
                        };
                      }
                      return s;
                    });
                    updateMenuSections(newMenuSections);
                  }}
                />
                )}
                {!sectionTitleKey && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Pencil size={16} className="text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("workbench.editor.clickToFocus")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                )}
              </>
            )}
            </div>
            <SectionActionsPopover sectionId={activeSection || "basic"} />
          </div>
        </motion.div>

        <motion.div
          className={cn(
            "rounded-lg",
            "bg-card border-border"
          )}
        >
          {renderFields()}
        </motion.div>
      </div>
    </motion.div>
  );
}
