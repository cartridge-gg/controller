import { createContext } from "react";

type UIContextValue = {
  account?: {
    username: string;
    address: string;
  };
  chainId?: string;
  closeModal?: () => void;
  openSettings?: () => void;
};

export const UIContext = createContext<UIContextValue>({});

export const UIProvider = UIContext.Provider;
