import { createContext } from "react";
import Controller from "@/utils/controller";
import { ConnectionCtx } from "@/utils/connection";
import { ParsedSessionPolicies } from "@/hooks/session";
import { ControllerTheme } from "@cartridge/ui-next";
import {
  ExternalWalletType,
  ExternalWallet,
  ExternalWalletResponse,
} from "@cartridge/controller";

export const ConnectionContext = createContext<
  ConnectionContextValue | undefined
>(undefined);

export type ConnectionContextValue = {
  context: ConnectionCtx;
  controller?: Controller;
  externalWallets?: ExternalWallet[];
  origin?: string;
  rpcUrl?: string;
  chainId?: string;
  policies?: ParsedSessionPolicies;
  theme: VerifiableControllerTheme;
  setContext: (context: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
  closeModal: () => void;
  openModal: () => void;
  logout: () => void;
  openSettings: () => void;
  externalDetectWallets: () => Promise<ExternalWallet[]>;
  externalConnectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse>;
  externalSignIn: (
    type: ExternalWalletType,
    challenge: string,
  ) => Promise<ExternalWalletResponse>;
  externalSignTypedData: (
    type: ExternalWalletType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) => Promise<ExternalWalletResponse>;
  externalSignMessage: (
    type: ExternalWalletType,
    message: string,
  ) => Promise<ExternalWalletResponse>;
  externalGetBalance: (
    type: ExternalWalletType,
    tokenAddress?: string,
  ) => Promise<ExternalWalletResponse>;
};

export type VerifiableControllerTheme = ControllerTheme & {
  verified: boolean;
};
