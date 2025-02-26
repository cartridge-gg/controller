import { useAchievements } from "#hooks/achievements";
import { createContext } from "react";

export type DataContextType = {
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
