import { useContext } from "react";
import { UpgradeContext, UpgradeInterface } from "./upgrade-context";

export const useUpgrade = (): UpgradeInterface => {
  const context = useContext(UpgradeContext);
  if (!context) {
    throw new Error("useUpgrade must be used within an UpgradeProvider");
  }
  return context;
};
