import { ResumeTemplate } from "@/types/template";

export const timelineConfig: ResumeTemplate = {
  id: "timeline",
  name: "Timeline",
  description: "Timeline layout, emphasizing chronological order of experiences",
  translationKey: "timeline",
  thumbnail: "timeline",
  layout: "timeline",
  colorScheme: {
    primary: "#18181b",
    secondary: "#64748b",
    background: "#ffffff",
    text: "#212529",
  },
  spacing: {
    sectionGap: 1,
    itemGap: 12,
    contentPadding: 24,
  },
  basic: {
    layout: "left",
  },
  availableSections: ["skills", "experience", "projects", "education", "selfEvaluation", "certificates"],
};
