import { useEffect, useState } from "react";
import { loadConfig } from "@cartridge/presets";

export const usePresetColor = (configName: string | null | undefined) => {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!configName) {
      setColor(null);
      return;
    }

    loadConfig(configName).then((config) => {
      setColor(config?.theme?.colors?.primary?.toString() ?? null);
    });
  }, [configName]);

  return color;
};

/**
 * @deprecated No longer needed. usePresetColor now loads configs on demand.
 */
export function ControllerPresetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
