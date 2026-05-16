import { ResumeData, Experience, Education, Project, CustomItem } from "@/types/resume";

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function extractSectionContent(data: ResumeData, sectionId: string): string {
  switch (sectionId) {
    case "basic": {
      const parts: string[] = [];
      const { basic } = data;
      const fields = basic.fieldOrder?.filter((f) => f.visible) ?? [];
      for (const f of fields) {
        const val = basic[f.key as keyof typeof basic];
        if (val && typeof val === "string" && val.trim()) {
          parts.push(`${f.label}: ${val}`);
        }
      }
      return parts.join("\n");
    }
    case "skills":
      return data.skillContent ? stripHtml(data.skillContent) : "";
    case "experience":
      return data.experience
        ?.filter((e: Experience) => e.visible !== false)
        .map((e: Experience) => `${e.position} at ${e.company} (${e.date})\n${stripHtml(e.details || "")}`)
        .join("\n\n") || "";
    case "projects":
      return data.projects
        ?.filter((p: Project) => p.visible)
        .map((p: Project) => `${p.name} (${p.date})\nRole: ${p.role}\n${stripHtml(p.description || "")}`)
        .join("\n\n") || "";
    case "education":
      return data.education
        ?.filter((e: Education) => e.visible !== false)
        .map((e: Education) => `${e.degree} in ${e.major} from ${e.school} (${e.startDate}-${e.endDate})${e.gpa ? `\nGPA: ${e.gpa}` : ""}`)
        .join("\n\n") || "";
    case "selfEvaluation":
      return data.selfEvaluationContent ? stripHtml(data.selfEvaluationContent) : "";
    default:
      // Custom sections
      if (data.customData?.[sectionId]) {
        return data.customData[sectionId]
          ?.filter((item: CustomItem) => item.visible)
          .map((item: CustomItem) => `${item.title} ${item.subtitle ? `(${item.subtitle})` : ""}${item.dateRange ? ` - ${item.dateRange}` : ""}\n${stripHtml(item.description || "")}`)
          .join("\n\n") || "";
      }
      return "";
  }
}
