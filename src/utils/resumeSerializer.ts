import { ResumeData } from "@/types/resume";

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

export function serializeResumeForAI(data: ResumeData): string {
  const sections: string[] = [];

  sections.push("# Resume");
  sections.push("");

  // Basic info
  const { basic } = data;
  const visibleFields = basic.fieldOrder?.filter((f) => f.visible) ?? [];
  sections.push("## Profile");
  for (const field of visibleFields) {
    const value = basic[field.key as keyof typeof basic];
    if (value && typeof value === "string" && value.trim()) {
      sections.push(`**${field.label}**: ${value}`);
    }
  }
  for (const cf of basic.customFields) {
    if (cf.visible !== false && cf.value?.trim()) {
      sections.push(`**${cf.label}**: ${cf.value}`);
    }
  }
  sections.push("");

  // Menu sections in order
  const enabledSections = data.menuSections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  for (const section of enabledSections) {
    switch (section.id) {
      case "skills":
        if (data.skillContent?.trim()) {
          sections.push("## Skills");
          sections.push(stripHtml(data.skillContent));
          sections.push("");
        }
        break;

      case "experience":
        if (data.experience?.length) {
          sections.push("## Work Experience");
          for (const exp of data.experience) {
            if (exp.visible === false) continue;
            sections.push(`### ${exp.position || "Untitled"} at ${exp.company || "Unknown"}`);
            if (exp.date) sections.push(`**Period**: ${exp.date}`);
            if (exp.details) sections.push(stripHtml(exp.details));
            sections.push("");
          }
        }
        break;

      case "projects":
        if (data.projects?.length) {
          sections.push("## Projects");
          for (const proj of data.projects) {
            if (!proj.visible) continue;
            sections.push(`### ${proj.name || "Untitled Project"}`);
            if (proj.role) sections.push(`**Role**: ${proj.role}`);
            if (proj.date) sections.push(`**Period**: ${proj.date}`);
            if (proj.description) sections.push(stripHtml(proj.description));
            if (proj.link) sections.push(`**Link**: ${proj.link}`);
            sections.push("");
          }
        }
        break;

      case "education":
        if (data.education?.length) {
          sections.push("## Education");
          for (const edu of data.education) {
            if (edu.visible === false) continue;
            sections.push(`### ${edu.school || "Unknown School"}`);
            if (edu.major) sections.push(`**Major**: ${edu.major}`);
            if (edu.degree) sections.push(`**Degree**: ${edu.degree}`);
            if (edu.startDate || edu.endDate) {
              sections.push(`**Period**: ${edu.startDate || ""} - ${edu.endDate || ""}`);
            }
            if (edu.gpa) sections.push(`**GPA**: ${edu.gpa}`);
            if (edu.description) sections.push(stripHtml(edu.description));
            sections.push("");
          }
        }
        break;

      case "selfEvaluation":
        if (data.selfEvaluationContent?.trim()) {
          sections.push("## Self Evaluation");
          sections.push(stripHtml(data.selfEvaluationContent));
          sections.push("");
        }
        break;

      default:
        // Custom sections
        if (data.customData?.[section.id]?.length) {
          sections.push(`## ${section.title}`);
          for (const item of data.customData[section.id]) {
            if (!item.visible) continue;
            const parts: string[] = [];
            if (item.title) parts.push(item.title);
            if (item.subtitle) parts.push(`(${item.subtitle})`);
            sections.push(`### ${parts.join(" ") || "Untitled"}`);
            if (item.dateRange) sections.push(`**Period**: ${item.dateRange}`);
            if (item.description) sections.push(stripHtml(item.description));
            sections.push("");
          }
        }
        break;
    }
  }

  return sections.join("\n");
}
