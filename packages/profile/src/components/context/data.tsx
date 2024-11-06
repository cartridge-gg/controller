import { createContext, useState, ReactNode } from "react";
import { useAchievements } from "@/hooks/achievements";

type DataContextType = {
  trophies: ReturnType<typeof useAchievements>;
  setAccountAddress: (address: string | undefined) => void;
};

const initialState: DataContextType = {
  trophies: {
    achievements: [],
    players: [],
    isLoading: false,
  },
  setAccountAddress: () => {},
};

export const DataContext = createContext<DataContextType>(initialState);

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
