"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/compat/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CUSTOM_MODULE_PRESETS, CustomModulePreset } from "@/config/customModules";
import { cn } from "@/lib/utils";

interface AddModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (preset: CustomModulePreset, name: string) => void;
}

export function AddModuleDialog({
  open,
  onOpenChange,
  onCreate,
}: AddModuleDialogProps) {
  const t = useTranslations("workbench.sidePanel.layout");

  const defaultNameFor = (preset: CustomModulePreset) => t(preset.titleKey);

  const [selected, setSelected] = useState<CustomModulePreset>(
    CUSTOM_MODULE_PRESETS[0]
  );
  const [name, setName] = useState(defaultNameFor(CUSTOM_MODULE_PRESETS[0]));
  const [nameTouched, setNameTouched] = useState(false);

  // Reset to a clean state each time the dialog opens.
  useEffect(() => {
    if (open) {
      setSelected(CUSTOM_MODULE_PRESETS[0]);
      setName(defaultNameFor(CUSTOM_MODULE_PRESETS[0]));
      setNameTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectPreset = (preset: CustomModulePreset) => {
    setSelected(preset);
    // If the user hasn't typed a custom name, follow the preset's default.
    if (!nameTouched) {
      setName(defaultNameFor(preset));
    }
  };

  const handleCreate = () => {
    const finalName = name.trim() || defaultNameFor(selected);
    onCreate(selected, finalName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("addModule.title")}</DialogTitle>
          <DialogDescription>{t("addModule.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Preset grid */}
          <div className="grid grid-cols-3 gap-2">
            {CUSTOM_MODULE_PRESETS.map((preset) => {
              const isSelected = preset.baseType === selected.baseType;
              return (
                <button
                  key={preset.baseType}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:bg-accent/50"
                  )}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-xs font-medium leading-tight">
                    {t(preset.titleKey)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {t("addModule.nameLabel")}
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
              placeholder={defaultNameFor(selected)}
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {selected.mode === "content"
                ? t("addModule.hintContent")
                : t("addModule.hintList")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("addModule.cancel")}
          </Button>
          <Button onClick={handleCreate}>{t("addModule.create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
