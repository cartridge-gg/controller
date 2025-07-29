import { useContext } from "react";
import { FeaturesContext, FeaturesContextValue } from "./features";
import { Feature } from "./features";

export function useFeatures(): FeaturesContextValue {
  const context = useContext(FeaturesContext);
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
}

export function useFeature(name: Feature): boolean {
  const { isFeatureEnabled } = useFeatures();
  return isFeatureEnabled(name);
}
