"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/i18n/compat/client";
import { useResumeReview } from "@/hooks/useResumeReview";
import { useResumeStore } from "@/store/useResumeStore";
import { ReviewFinding, ReviewCategory } from "@/types/review";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet-no-overlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, AlertTriangle, Info, AlertCircle, ListChecks, LayoutGrid, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReviewScoreRing } from "./ReviewScoreRing";

const CATEGORY_ICONS: Record<string, string> = {
  content: "pencil",
  ats: "file-search",
  keywords: "hash",
  formatting: "align-left",
  completeness: "list-checks",
};

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, color: "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50" },
  warning: { icon: AlertTriangle, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/50" },
  info: { icon: Info, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50" },
};

export function ReviewDrawer() {
  const t = useTranslations("aiReview");
  const {
    findings,
    overallScore,
    isReviewing,
    selectedFindingIndex,
    appliedIds,
    checkedIds,
    viewMode,
    categoryFilter,
    selectFinding,
    markApplied,
    toggleChecked,
    setChecked,
    setViewMode,
    setCategoryFilter,
    applyFinding,
    clearReview,
  } = useResumeReview();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmFinding, setConfirmFinding] = useState<ReviewFinding | null>(null);

  useEffect(() => {
    if (findings.length > 0 && overallScore !== null) {
      setIsOpen(true);
    }
  }, [findings.length, overallScore]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener("open-review-drawer", handleOpen);
    return () => document.removeEventListener("open-review-drawer", handleOpen);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) clearReview();
  };

  const handleApply = (finding: ReviewFinding) => {
    const success = applyFinding(finding);
    if (success) {
      toast.success(t("applied"));
    } else {
      toast.error(t("applyError"));
    }
    setConfirmFinding(null);
  };

  const handleBatchApply = () => {
    const toApply = findings.filter((f) => checkedIds.has(f.id) && f.autoApplicable && !appliedIds.has(f.id));
    let applied = 0;
    for (const finding of toApply) {
      const success = applyFinding(finding);
      if (success) applied++;
    }
    toast.success(t("batchApplySuccess", { count: applied }));
    setChecked(new Set());
  };

  const filteredFindings = categoryFilter === "all"
    ? findings
    : findings.filter((f) => f.category === categoryFilter);

  const categories = ["all", "content", "ats", "keywords", "formatting", "completeness"] as const;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={false}>
        <SheetContent side="left" className="w-[400px] sm:w-[450px] p-0 flex flex-col gap-0 border-r shadow-lg bg-muted/30 backdrop-blur-xl">
          {/* Header */}
          <div className="p-6 pb-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-semibold">{t("title")}</SheetTitle>
                  <SheetDescription className="text-xs">
                    {t("description", { count: filteredFindings.length })}
                  </SheetDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => { clearReview(); setIsOpen(false); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Score ring */}
            {overallScore !== null && (
              <div className="flex justify-center mb-4">
                <ReviewScoreRing score={overallScore} />
              </div>
            )}

            {/* View mode toggle + Category filter */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border overflow-hidden">
                <Button
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 rounded-none"
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === "checklist" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 rounded-none"
                  onClick={() => setViewMode("checklist")}
                >
                  <ListChecks className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex gap-1 flex-1 overflow-x-auto">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs whitespace-nowrap"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {t(`categories.${cat}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 px-6 py-6 h-full">
            <div className="space-y-4 pb-20">
              {isReviewing && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">{t("reviewing")}</p>
                </div>
              )}

              {!isReviewing && filteredFindings.length === 0 && overallScore !== null && (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("noFindings")}</h3>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {viewMode === "cards" ? (
                  filteredFindings.map((finding, index) => {
                    const severity = SEVERITY_CONFIG[finding.severity];
                    const SeverityIcon = severity.icon;
                    const isApplied = appliedIds.has(finding.id);

                    return (
                      <motion.div
                        key={finding.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={cn(
                          "group relative bg-card rounded-xl border border-border/50 shadow-sm transition-all overflow-hidden",
                          "hover:shadow-md hover:border-primary/20",
                          selectedFindingIndex === index && "border-primary bg-primary/5 shadow-sm",
                          isApplied && "opacity-50"
                        )}
                        onClick={() => selectFinding(index)}
                      >
                        <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center bg-muted/20 rounded-t-xl">
                          <div className="flex items-center gap-2">
                            <SeverityIcon className={cn("w-3.5 h-3.5", severity.color.split(" ")[0])} />
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5">
                              {t(`categories.${finding.category}`)}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5">
                            {finding.sectionId}
                          </Badge>
                        </div>

                        <div className="p-4 space-y-3">
                          <p className="text-sm text-foreground/90 leading-relaxed">{finding.message}</p>

                          {finding.originalText && (
                            <div className="p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 text-xs border border-red-100/50 dark:border-red-900/30">
                              <span className="line-through text-muted-foreground">{finding.originalText}</span>
                            </div>
                          )}

                          {finding.suggestedFix && (
                            <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-xs border border-emerald-100/50 dark:border-emerald-900/30">
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{finding.suggestedFix}</span>
                            </div>
                          )}

                          {finding.autoApplicable && !isApplied && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmFinding(finding);
                                }}
                              >
                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                {t("apply")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markApplied(finding.id);
                                }}
                              >
                                {t("ignore")}
                              </Button>
                            </div>
                          )}

                          {isApplied && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                              <Check className="w-3.5 h-3.5" />
                              {t("applied")}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  // Checklist view
                  filteredFindings.map((finding) => {
                    const isApplied = appliedIds.has(finding.id);
                    const isChecked = checkedIds.has(finding.id);

                    return (
                      <motion.div
                        key={finding.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card",
                          isApplied && "opacity-50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecked(finding.id)}
                          disabled={!finding.autoApplicable || isApplied}
                          className="h-4 w-4 rounded border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                              {finding.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{finding.sectionId}</span>
                          </div>
                          <p className="text-xs text-foreground/80 mt-1 truncate">{finding.message}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>

              {/* Batch apply button */}
              {viewMode === "checklist" && checkedIds.size > 0 && (
                <div className="sticky bottom-0 pt-2">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleBatchApply}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {t("applySelected", { count: checkedIds.size })}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Confirmation dialog */}
      <Dialog open={!!confirmFinding} onOpenChange={() => setConfirmFinding(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("confirmApply.title")}</DialogTitle>
            <DialogDescription>{t("confirmApply.description")}</DialogDescription>
          </DialogHeader>
          {confirmFinding && (
            <div className="space-y-3 py-4">
              {confirmFinding.originalText && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("confirmApply.original")}</p>
                  <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 text-sm border border-red-100/50">
                    <span className="line-through">{confirmFinding.originalText}</span>
                  </div>
                </div>
              )}
              {confirmFinding.suggestedFix && (
                <div>
                  <p className="text-xs font-medium text-emerald-600 mb-1">{t("confirmApply.suggested")}</p>
                  <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-sm border border-emerald-100/50">
                    {confirmFinding.suggestedFix}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmFinding(null)}>
              {t("confirmApply.cancel")}
            </Button>
            <Button onClick={() => confirmFinding && handleApply(confirmFinding)}>
              {t("confirmApply.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
