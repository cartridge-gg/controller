import { createContext, PropsWithChildren } from "react";
import Controller from "utils/controller";
import { ConnectionCtx } from "utils/connection";
import { PaymasterOptions, Policy, Prefund } from "@cartridge/controller";

export const ConnectionContext =
  createContext<ConnectionContextValue>(undefined);

export type ConnectionContextValue = {
  context: ConnectionCtx;
  controller: Controller;
  origin: string;
  rpcUrl: string;
  chainId: string;
  chainName: string;
  policies: Policy[];
  prefunds: Prefund[];
  paymaster?: PaymasterOptions;
  hasPrefundRequest: boolean;
  error?: Error;
  setContext: (context: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
  closeModal: () => void;
  openModal: () => void;
  logout: (context: ConnectionCtx) => void;
  setDelegate: (context: ConnectionCtx) => void;
  setDelegateTransaction: (
    context: ConnectionCtx,
    delegateAddress: string,
  ) => void;
  setExternalOwnerTransaction: (
    context: ConnectionCtx,
    externalOwnerAddress: string,
  ) => void;
  removeExternalOwnerTransaction: (
    context: ConnectionCtx,
    externalOwnerAddress: string,
  ) => void;
  openSettings: (context: ConnectionCtx) => void;
  openMenu: (context: ConnectionCtx) => void;
  setExternalOwner: (context: ConnectionCtx) => void;
};

export function ConnectionProvider({
  children,
  value,
}: { value: ConnectionContextValue } & PropsWithChildren) {
  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}
