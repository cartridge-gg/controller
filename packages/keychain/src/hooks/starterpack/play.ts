import { useCallback } from "react";
import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context";

export function useStarterpackPlayHandler() {
  const { closeModal, parent } = useConnection();
  const { navigateToRoot } = useNavigation();

  return useCallback(() => {
    if (
      parent &&
      "onStarterpackPlay" in parent &&
      typeof parent.onStarterpackPlay === "function"
    ) {
      parent.onStarterpackPlay().catch((error: unknown) => {
        console.error("Failed to notify parent of starterpack play:", error);
        closeModal?.();
      });
    } else {
      closeModal?.();
    }

    navigateToRoot();
  }, [parent, closeModal, navigateToRoot]);
}
