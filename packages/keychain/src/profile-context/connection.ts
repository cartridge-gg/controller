import { isIframe } from "@cartridge/ui/utils";
import { createContext } from "react";
import { Call, RpcProvider } from "starknet";

export type ConnectionContextType = {
  origin: string;
  parent: ParentMethods;
  provider: RpcProvider;
  chainId: string;
  erc20: string[];
  methods: { name: string; entrypoint: string }[];
  project?: string;
  namespace?: string;
  version?: string;
  closable?: boolean;
  visitor?: boolean;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  closeModal: () => void;
  openSettings: () => void;
  logout: () => Promise<void>;
};

export type ParentMethods = {
  close: () => void;
  logout: () => Promise<void>;
  openSettings: () => void;
  openPurchaseCredits: () => void;
  openExecute: (
    calls: Call[],
    chain?: string,
  ) => Promise<{ status: boolean; transactionHash: string }>;
};

export const initialState: ConnectionContextType = {
  origin: location.origin,
  parent: {
    logout: async () => {},
    close: () => {},
    openSettings: () => {},
    openPurchaseCredits: () => {},
    openExecute: async () => ({ status: false, transactionHash: "" }),
  },
  provider: new RpcProvider({ nodeUrl: import.meta.env.VITE_RPC_SEPOLIA }),
  chainId: "",
  erc20: [],
  methods: [],
  isVisible: !isIframe(),
  setIsVisible: () => {},
  closeModal: () => {},
  openSettings: () => {},
  logout: async () => {},
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);
