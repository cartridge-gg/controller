import { createContext, useContext, useState } from "react";

interface AdvancedContextType {
  advanced: boolean;
  setAdvanced: (value: boolean) => void;
}

const AdvancedContext = createContext<AdvancedContextType | undefined>(
  undefined,
);

export function AdvancedProvider({ children }: { children: React.ReactNode }) {
  const [advanced, setAdvanced] = useState(true);

  return (
    <AdvancedContext.Provider value={{ advanced, setAdvanced }}>
      {children}
    </AdvancedContext.Provider>
  );
}

export function useAdvanced() {
  const ctx = useContext(AdvancedContext);
  if (!ctx) {
    throw new Error("useAdvanced must be used within an AdvancedProvider");
  }
  return ctx;
}
