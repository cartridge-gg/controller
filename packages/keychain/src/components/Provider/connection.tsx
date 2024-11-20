import { createContext, PropsWithChildren } from "react";
import Controller from "utils/controller";
import { ConnectionCtx } from "utils/connection";
import { Policy, Prefund } from "@cartridge/controller";
import { UpgradeInterface } from "hooks/upgrade";

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
  hasPrefundRequest: boolean;
  error?: Error;
  upgrade: UpgradeInterface;
  setContext: (context: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
  closeModal: () => void;
  openModal: () => void;
  logout: () => void;
  openSettings: () => void;
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
