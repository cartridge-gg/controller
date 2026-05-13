import { useCallback, useRef } from "react";
import { Feature, useFeatures } from "@/hooks/features";

// helper hook to enable a feature after 3 clicks
export function useTripleClick({
  featureName,
  callback,
}: {
  featureName?: Feature;
  callback?: () => void;
}) {
  const { enableFeature } = useFeatures();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleTripleClick = useCallback(() => {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      if (featureName) {
        enableFeature(featureName);
      }
      callback?.();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  }, [enableFeature, featureName, callback]);

  return handleTripleClick;
}
