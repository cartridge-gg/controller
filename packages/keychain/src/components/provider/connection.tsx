import { ParentMethods } from "@/hooks/connection";
import { ParsedSessionPolicies } from "@/hooks/session";
import { ConnectionCtx } from "@/utils/connection";
import Controller from "@/utils/controller";
import {
  AuthOptions,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { ControllerTheme } from "@cartridge/ui";
import { createContext } from "react";

export const ConnectionContext = createContext<
  ConnectionContextValue | undefined
>(undefined);

export type ConnectionContextValue = {
  parent: ParentMethods | undefined;
  context?: ConnectionCtx;
  controller?: Controller;
  origin: string;
  rpcUrl: string;
  policies?: ParsedSessionPolicies;
  theme: VerifiableControllerTheme;
  isConfigLoading: boolean;
  configSignupOptions?: AuthOptions;
  verified: boolean;
  chainId?: string;
  setController: (controller?: Controller) => void;
  setContext: (ctx: ConnectionCtx | undefined) => void;
  closeModal: () => Promise<void>;
  openModal: () => Promise<void>;
  logout: () => Promise<void>;
  openSettings: () => void;
  externalDetectWallets: () => Promise<ExternalWallet[]>;
  externalConnectWallet: (
    type: ExternalWalletType,
    address?: string,
  ) => Promise<ExternalWalletResponse>;
  externalSignTypedData: (
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) => Promise<ExternalWalletResponse>;
  externalSignMessage: (
    identifier: string,
    message: string,
  ) => Promise<ExternalWalletResponse>;
  externalSendTransaction: (
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txn: any,
  ) => Promise<ExternalWalletResponse>;
  externalGetBalance: (
    identifier: string,
    tokenAddress?: string,
  ) => Promise<ExternalWalletResponse>;
};

export type VerifiableControllerTheme = ControllerTheme & {
  verified: boolean;
};
