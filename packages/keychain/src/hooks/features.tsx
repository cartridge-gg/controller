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

export type Feature =
  | "none"
  | "advanced-view"
  | "coinflow-support"
  | "coinflow-sandbox"
  | "coinflow-payouts"
  | "connection-instagram"
  | "connection-tiktok"
  | "registered-accounts"
  | "recovery-accounts";

// --- Helper Functions ---

const normalizeFeatures = (value: unknown): Record<string, boolean> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, boolean] => {
      return typeof entry[1] === "boolean";
    }),
  );
};

const parseFeatures = (value: string | null): Record<string, boolean> => {
  if (value === null) return {};

  return normalizeFeatures(JSON.parse(value));
};

const loadFeaturesFromStorage = (): Record<string, boolean> => {
  try {
    const storedFeatures = localStorage.getItem(LOCAL_STORAGE_KEY);
    return parseFeatures(storedFeatures);
  } catch (error) {
    console.error("Failed to load features from local storage:", error);
    return {};
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
  enableFeature: (name: Feature) => void;
  disableFeature: (name: Feature) => void;
  isFeatureEnabled: (name: Feature) => boolean;
}

const FeaturesContext = createContext<FeaturesContextValue | undefined>(
  undefined,
);

export const FeatureProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [features, setFeatures] = useState<Record<string, boolean>>(() =>
    loadFeaturesFromStorage(),
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOCAL_STORAGE_KEY) return;

      try {
        setFeatures(parseFeatures(event.newValue));
      } catch (error) {
        console.error("Failed to load features from local storage:", error);
        setFeatures({});
      }
    };

    window.addEventListener("storage", handleStorage, false);

    return () => {
      window.removeEventListener("storage", handleStorage, false);
    };
  }, []);

  // Persist changes to local storage
  useEffect(() => {
    saveFeaturesToStorage(features);
  }, [features]);

  const enableFeature = useCallback((name: Feature) => {
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [name]: true,
    }));
  }, []);

  const disableFeature = useCallback((name: Feature) => {
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [name]: false,
    }));
  }, []);

  const isFeatureEnabled = useCallback(
    (name: Feature) => {
      return features[name] === true;
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

export function useAdvancedView(): boolean {
  return useFeature("advanced-view");
}
