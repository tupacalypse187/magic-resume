import { useReviewStore } from "@/store/useReviewStore";
import { useResumeStore } from "@/store/useResumeStore";
import { serializeResumeForAI } from "@/utils/resumeSerializer";
import { ReviewFinding } from "@/types/review";

export function useResumeReview() {
  const store = useReviewStore();
  const { activeResume, updateResume } = useResumeStore();

  const startReview = async () => {
    if (!activeResume) return;
    const serialized = serializeResumeForAI(activeResume);
    await store.reviewResume(serialized);
  };

  const applyFinding = (finding: ReviewFinding) => {
    if (!activeResume || !finding.autoApplicable || !finding.suggestedFix) return false;

    const newResume = JSON.parse(JSON.stringify(activeResume));
    let replaced = false;

    const applyToText = (obj: Record<string, unknown>) => {
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === "string" && finding.originalText && val.includes(finding.originalText)) {
          obj[key] = val.replace(finding.originalText, finding.suggestedFix!);
          replaced = true;
        } else if (typeof val === "object" && val !== null) {
          applyToText(val as Record<string, unknown>);
        }
      }
    };

    applyToText(newResume as unknown as Record<string, unknown>);

    if (replaced) {
      store.pushUndo({
        resumeId: activeResume.id,
        snapshot: JSON.parse(JSON.stringify(activeResume)),
        findingIds: [finding.id],
      });
      updateResume(activeResume.id, newResume);
      store.markApplied(finding.id);
      return true;
    }
    return false;
  };

  const undoLastApply = () => {
    const entry = store.popUndo();
    if (entry) {
      updateResume(entry.resumeId, entry.snapshot as any);
    }
  };

  return {
    ...store,
    startReview,
    applyFinding,
    undoLastApply,
  };
}
