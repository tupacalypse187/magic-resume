import { CustomItem } from "@/types/resume";

export type CustomModuleMode = "content" | "list";

export type CustomItemFieldKey = keyof Pick<
  CustomItem,
  "title" | "subtitle" | "dateRange" | "description"
>;

export interface CustomFieldDef {
  key: CustomItemFieldKey;
  /** i18n key under `workbench.sidePanel.layout.addModule.fields.*` */
  labelKey: string;
}

export interface CustomModulePreset {
  /** Stored on MenuSection.baseType to recall this preset later. */
  baseType: string;
  mode: CustomModuleMode;
  icon: string;
  /** i18n key under `workbench.sidePanel.layout.addModule.presets.*` for the default section name. */
  titleKey: string;
  /** list-mode field labels (order = render order). */
  fields?: CustomFieldDef[];
}

/**
 * Presets offered in the "Add Module" dialog. Each defines how a custom section
 * behaves in the editor:
 *  - `content` mode: a single rich-text editor (like Skills / Self Evaluation).
 *  - `list` mode: a reorderable list of entries with relabeled fields.
 *
 * Templates render custom sections through the existing 4-slot CustomSection, so
 * no template changes are needed — these presets only drive the editor UI and the
 * default name/icon.
 */
export const CUSTOM_MODULE_PRESETS: CustomModulePreset[] = [
  {
    baseType: "content",
    mode: "content",
    icon: "📝",
    titleKey: "addModule.presets.content",
  },
  {
    baseType: "skills",
    mode: "content",
    icon: "⚡",
    titleKey: "addModule.presets.skills",
  },
  {
    baseType: "selfEvaluation",
    mode: "content",
    icon: "💬",
    titleKey: "addModule.presets.selfEvaluation",
  },
  {
    baseType: "experience",
    mode: "list",
    icon: "💼",
    titleKey: "addModule.presets.experience",
    fields: [
      { key: "title", labelKey: "addModule.fields.position" },
      { key: "subtitle", labelKey: "addModule.fields.company" },
      { key: "dateRange", labelKey: "addModule.fields.date" },
      { key: "description", labelKey: "addModule.fields.details" },
    ],
  },
  {
    baseType: "education",
    mode: "list",
    icon: "🎓",
    titleKey: "addModule.presets.education",
    fields: [
      { key: "title", labelKey: "addModule.fields.degree" },
      { key: "subtitle", labelKey: "addModule.fields.school" },
      { key: "dateRange", labelKey: "addModule.fields.dates" },
      { key: "description", labelKey: "addModule.fields.description" },
    ],
  },
  {
    baseType: "projects",
    mode: "list",
    icon: "🚀",
    titleKey: "addModule.presets.projects",
    fields: [
      { key: "title", labelKey: "addModule.fields.projectName" },
      { key: "subtitle", labelKey: "addModule.fields.role" },
      { key: "dateRange", labelKey: "addModule.fields.date" },
      { key: "description", labelKey: "addModule.fields.description" },
    ],
  },
];

const PRESET_BY_BASE_TYPE = new Map(
  CUSTOM_MODULE_PRESETS.map((p) => [p.baseType, p])
);

export function getCustomModulePreset(
  baseType?: string
): CustomModulePreset | undefined {
  if (!baseType) return undefined;
  return PRESET_BY_BASE_TYPE.get(baseType);
}
