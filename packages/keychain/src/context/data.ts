import { CardProps } from "@/components/provider/data.js";
import { useAchievements } from "@/hooks/achievements";
import {
  ActivitiesQuery,
  TransfersQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { createContext } from "react";

export type DataContextType = {
  events: CardProps[];
  trophies: ReturnType<typeof useAchievements>;
  transfers?: TransfersQuery;
  transactions?: ActivitiesQuery;
  status?: "loading" | "error" | "success";
  setAccountAddress: (address: string | undefined) => void;
  refetchTransfers: () => void;
  refetchTransactions: () => void;
};

const initialState: DataContextType = {
  events: [],
  trophies: {
    achievements: [],
    players: [],
    status: "loading",
  },
  setAccountAddress: () => {},
  refetchTransfers: () => {},
  refetchTransactions: () => {},
};

export const DataContext = createContext<DataContextType>(initialState);
