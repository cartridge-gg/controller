import { createContext } from "react";

type UIContextValue = {
  account?: {
    username: string;
    address: string;
  };
  chainId?: string;
};

export const UIContext = createContext<UIContextValue>({});

export const UIProvider = UIContext.Provider;
