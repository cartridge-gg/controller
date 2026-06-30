import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadConfig } from "@cartridge/presets";

type PresetColorContextValue = {
  /** Returns the cached primary color for a preset, or null if unknown. */
  getColor: (configName: string) => string | null;
  /** Fetches and caches a preset's color the first time it is requested. */
  ensureLoaded: (configName: string) => void;
};

const PresetColorContext = createContext<PresetColorContextValue | null>(null);

export function ControllerPresetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cache of configName -> primary color. `null` means the preset was loaded
  // but has no primary color.
  const [colors, setColors] = useState<Record<string, string | null>>({});
  // Tracks presets whose fetch has already been started so each preset is
  // fetched at most once for the lifetime of the provider.
  const requested = useRef<Set<string>>(new Set());

  const ensureLoaded = useCallback((configName: string) => {
    if (requested.current.has(configName)) {
      return;
    }
    requested.current.add(configName);

    loadConfig(configName)
      .then((config) => {
        const color = config?.theme?.colors?.primary?.toString() ?? null;
        setColors((prev) => ({ ...prev, [configName]: color }));
      })
      .catch(() => {
        setColors((prev) => ({ ...prev, [configName]: null }));
      });
  }, []);

  const getColor = useCallback(
    (configName: string) => colors[configName] ?? null,
    [colors],
  );

  const value = useMemo<PresetColorContextValue>(
    () => ({ getColor, ensureLoaded }),
    [getColor, ensureLoaded],
  );

  return (
    <PresetColorContext.Provider value={value}>
      {children}
    </PresetColorContext.Provider>
  );
}

export const usePresetColor = (configName: string | null | undefined) => {
  const ctx = useContext(PresetColorContext);

  useEffect(() => {
    if (configName) {
      ctx?.ensureLoaded(configName);
    }
  }, [configName, ctx]);

  if (!configName || !ctx) {
    return null;
  }
  return ctx.getColor(configName);
};
