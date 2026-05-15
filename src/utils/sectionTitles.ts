const STANDARD_SECTION_IDS = new Set([
  "basic",
  "skills",
  "experience",
  "projects",
  "education",
  "selfEvaluation",
  "certificates",
]);

export function isStandardSection(sectionId: string): boolean {
  return STANDARD_SECTION_IDS.has(sectionId);
}

const SECTION_TITLE_KEYS: Record<string, string> = {
  basic: "workbench.sidePanel.layout.standardSections.basic",
  skills: "workbench.sidePanel.layout.standardSections.skills",
  experience: "workbench.sidePanel.layout.standardSections.experience",
  projects: "workbench.sidePanel.layout.standardSections.projects",
  education: "workbench.sidePanel.layout.standardSections.education",
  selfEvaluation: "workbench.sidePanel.layout.standardSections.selfEvaluation",
  certificates: "workbench.sidePanel.layout.standardSections.certificates",
};

export function getSectionTitleKey(sectionId: string): string | null {
  return SECTION_TITLE_KEYS[sectionId] ?? null;
}
