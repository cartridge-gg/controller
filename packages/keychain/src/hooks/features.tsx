import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LOCAL_STORAGE_KEY = "@cartridge/features";

export type Feature = "none" | "connections" | "apple-pay-support";

// --- Helper Functions ---

const loadFeaturesFromStorage = (): Record<string, boolean> => {
  try {
    const storedFeatures = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedFeatures ? JSON.parse(storedFeatures) : {};
  } catch (error) {
    console.error("Failed to load features from local storage:", error);
    return {}; // Return empty object on error
  }
};

const saveFeaturesToStorage = (features: Record<string, boolean>): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(features));
  } catch (error) {
    console.error("Failed to save features to local storage:", error);
  }
};

// --- Context & Provider ---

interface FeaturesContextValue {
  features: Record<string, boolean>;
  enableFeature: (name: string) => void;
  disableFeature: (name: string) => void;
  isFeatureEnabled: (name: string) => boolean;
}

const FeaturesContext = createContext<FeaturesContextValue | undefined>(
  undefined,
);

export const FeatureProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [features, setFeatures] = useState<Record<string, boolean>>(() =>
    loadFeaturesFromStorage(),
  );

  useEffect(() => {
    window.addEventListener(
      "storage",
      function (event) {
        if (event.storageArea === localStorage) {
          setFeatures(loadFeaturesFromStorage());
        }
      },
      false,
    );
    return () => {
      window.removeEventListener("storage", () => {});
    };
  }, [setFeatures]);

  // Persist changes to local storage
  useEffect(() => {
    saveFeaturesToStorage(features);
  }, [features]);

  const enableFeature = useCallback((name: string) => {
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [name]: true,
    }));
  }, []);

  const disableFeature = useCallback((name: string) => {
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [name]: false,
    }));
  }, []);

  const isFeatureEnabled = useCallback(
    (name: string) => {
      return features[name] === true; // Explicitly check for true
    },
    [features],
  );

  const contextValue = useMemo(
    () => ({
      features,
      enableFeature,
      disableFeature,
      isFeatureEnabled,
    }),
    [features, enableFeature, disableFeature, isFeatureEnabled],
  );

  return (
    <FeaturesContext.Provider value={contextValue}>
      {children}
    </FeaturesContext.Provider>
  );
};

// --- Hooks ---

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
