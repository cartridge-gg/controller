import { isIframe } from "@cartridge/utils";
import { createContext } from "react";
import { Call, RpcProvider } from "starknet";

export type ConnectionContextType = {
  origin: string;
  parent: ParentMethods;
  provider: RpcProvider;
  chainId: string;
  erc20: string[];
  project?: string;
  namespace?: string;
  version?: string;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  closeModal: () => void;
  openSettings: () => void;
};

export type ParentMethods = {
  close: () => void;
  openSettings: () => void;
  openPurchaseCredits: () => void;
  openExecute: (calls: Call[], chain?: string) => Promise<boolean>;
};

export const initialState: ConnectionContextType = {
  origin: location.origin,
  parent: {
    close: () => {},
    openSettings: () => {},
    openPurchaseCredits: () => {},
    openExecute: async () => false,
  },
  provider: new RpcProvider({ nodeUrl: import.meta.env.VITE_RPC_SEPOLIA }),
  chainId: "",
  erc20: [],
  isVisible: !isIframe(),
  setIsVisible: () => {},
  closeModal: () => {},
  openSettings: () => {},
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);
