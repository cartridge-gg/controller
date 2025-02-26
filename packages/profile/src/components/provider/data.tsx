import { useState, ReactNode } from "react";
import { useAchievements } from "#hooks/achievements";
import { DataContext } from "#context/data";

export function DataProvider({ children }: { children: ReactNode }) {
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined,
  );

  const trophies = useAchievements(accountAddress);

  return (
    <DataContext.Provider value={{ trophies, setAccountAddress }}>
      {children}
    </DataContext.Provider>
  );
}
