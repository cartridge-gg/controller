import { isIframe } from "@cartridge/utils";
import { createContext } from "react";
import { Call, RpcProvider } from "starknet";
import {
  ExternalWalletType,
  ExternalWallet,
  ExternalWalletResponse,
} from "@cartridge/controller";

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

  // Wallet bridge methods
  externalDetectWallets: () => Promise<ExternalWallet[]>;
  externalConnectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse>;
  externalSignTransaction: (
    type: ExternalWalletType,
    tx: unknown,
  ) => Promise<ExternalWalletResponse>;
  externalGetBalance: (
    type: ExternalWalletType,
    tokenAddress?: string,
  ) => Promise<ExternalWalletResponse>;
};

export const initialState: ConnectionContextType = {
  origin: location.origin,
  parent: {
    close: () => {},
    openSettings: () => {},
    openPurchaseCredits: () => {},
    openExecute: async () => false,

    externalDetectWallets: () => Promise.resolve([]),
    externalConnectWallet: async () => ({
      success: false,
      wallet: "metamask",
      error: "Not ready",
    }),
    externalSignTransaction: async () => ({
      success: false,
      wallet: "metamask",
      error: "Not ready",
    }),
    externalGetBalance: async () => ({
      success: false,
      wallet: "metamask",
      error: "Not ready",
    }),
  },
  provider: new RpcProvider({ nodeUrl: import.meta.env.VITE_RPC_SEPOLIA }),
  chainId: "",
  erc20: [],
  methods: [],
  isVisible: !isIframe(),
  setIsVisible: () => {},
  closeModal: () => {},
  openSettings: () => {},
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);
