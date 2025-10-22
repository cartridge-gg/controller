"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SessionPolicies } from "@cartridge/controller";

export interface ControllerConfig {
  preset: string;
  slot: string;
  namespace: string;
  shouldOverridePresetPolicies: boolean;
  tokens: string[];
  policies?: SessionPolicies;
}

interface ControllerConfigContextType {
  config: ControllerConfig;
  updateConfig: (config: Partial<ControllerConfig>) => void;
}

const ControllerConfigContext = createContext<
  ControllerConfigContextType | undefined
>(undefined);

export function ControllerConfigProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useState<ControllerConfig>({
    preset: "pistols",
    slot: "arcade-pistols",
    namespace: "pistols",
    shouldOverridePresetPolicies: false,
    tokens: ["lords", "strk"],
  });

  const updateConfig = (newConfig: Partial<ControllerConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return (
    <ControllerConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ControllerConfigContext.Provider>
  );
}

export function useControllerConfig() {
  const context = useContext(ControllerConfigContext);
  if (!context) {
    throw new Error(
      "useControllerConfig must be used within ControllerConfigProvider",
    );
  }
  return context;
}
