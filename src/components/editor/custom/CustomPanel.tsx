import { memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reorder } from "framer-motion";
import { PlusCircle } from "lucide-react";
import CustomItem from "./CustomItem";
import Field from "../Field";
import { useResumeStore } from "@/store/useResumeStore";
import { CustomItem as CustomItemType } from "@/types/resume";
import { useTranslations } from "@/i18n/compat/client";
import { getCustomModulePreset } from "@/config/customModules";

const CustomPanel = memo(({ sectionId }: { sectionId: string }) => {
  const { addCustomItem, updateCustomData, updateCustomItem, activeResume } =
    useResumeStore();
  const { customData, menuSections } = activeResume || {};
  const items = (customData?.[sectionId] || []) as CustomItemType[];
  const t = useTranslations("workbench.sidePanel.layout");

  const section = menuSections?.find((s) => s.id === sectionId);
  const preset = getCustomModulePreset(section?.baseType);
  const isContent = preset?.mode === "content";
  const contentItem = items[0];

  // content mode represents a single rich-text body — make sure one item exists.
  useEffect(() => {
    if (isContent && items.length === 0) {
      addCustomItem(sectionId);
    }
  }, [isContent, items.length, sectionId, addCustomItem]);

  const handleCreateItem = () => {
    addCustomItem(sectionId);
  };

  return (
    <div
      className={cn(
        "space-y-4 px-4 py-4 rounded-lg",
        "bg-card"
      )}
    >
      {isContent ? (
        <Field
          value={contentItem?.description ?? ""}
          onChange={(value) => {
            if (contentItem) {
              updateCustomItem(sectionId, contentItem.id, { description: value });
            }
          }}
          type="editor"
          placeholder={t("addModule.contentPlaceholder")}
        />
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={(newOrder) => {
            updateCustomData(sectionId, newOrder);
          }}
          className="space-y-3"
        >
          {items.map((item: CustomItemType) => (
            <CustomItem key={item.id} item={item} sectionId={sectionId} />
          ))}

          <Button onClick={handleCreateItem} className={cn("w-full")}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {t("addButton")}
          </Button>
        </Reorder.Group>
      )}
    </div>
  );
});

CustomPanel.displayName = "CustomPanel";

export default CustomPanel;
