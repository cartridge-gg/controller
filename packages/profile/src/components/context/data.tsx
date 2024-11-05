import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useTokens } from "@/hooks/token";
import { useAchievements } from "@/hooks/achievements";

type DataContextType = {
  tokens: ReturnType<typeof useTokens>;
  trophies: ReturnType<typeof useAchievements>;
  tokensAddress: string | undefined;
  trophiesAddress: string | undefined;
  setTokensAddress: (address: string | undefined) => void;
  setTrophiesAddress: (address: string | undefined) => void;
};

const initialState: DataContextType = {
  tokens: {
    data: [],
    isFetching: false,
    isLoading: false,
    error: null,
  },
  trophies: {
    achievements: [],
    players: [],
    isLoading: false,
  },
  tokensAddress: undefined,
  trophiesAddress: undefined,
  setTokensAddress: () => {},
  setTrophiesAddress: () => {},
};

export const DataContext = createContext<DataContextType>(initialState);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataContextType>(initialState);

  const tokens = useTokens(state.tokensAddress);
  const trophies = useAchievements(state.trophiesAddress);

  useEffect(() => {
    setState((state) => ({ ...state, tokens }));
  }, [tokens]);

  useEffect(() => {
    setState((state) => ({ ...state, trophies }));
  }, [trophies]);

  const setTokensAddress = useCallback(
    (address: string | undefined) => {
      if (address === state.tokensAddress) return;
      setState((state) => ({ ...state, tokensAddress: address }));
    },
    [state.tokensAddress],
  );

  const setTrophiesAddress = useCallback(
    (address: string | undefined) => {
      if (address === state.trophiesAddress) return;
      setState((state) => ({ ...state, trophiesAddress: address }));
    },
    [state.trophiesAddress],
  );

  return (
    <DataContext.Provider
      value={{ ...state, setTokensAddress, setTrophiesAddress }}
    >
      {children}
    </DataContext.Provider>
  );
}
