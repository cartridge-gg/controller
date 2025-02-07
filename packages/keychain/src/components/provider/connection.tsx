import { createContext } from "react";
import Controller from "@/utils/controller";
import { ConnectionCtx } from "@/utils/connection";
import { UpgradeInterface } from "@/hooks/upgrade";
import { ParsedSessionPolicies } from "@/hooks/session";
import { VerifiableControllerTheme } from "@/context/theme";

export const ConnectionContext = createContext<
  ConnectionContextValue | undefined
>(undefined);

export type ConnectionContextValue = {
  context: ConnectionCtx;
  controller?: Controller;
  origin?: string;
  rpcUrl?: string;
  policies?: ParsedSessionPolicies;
  theme: VerifiableControllerTheme;
  hasPrefundRequest: boolean;
  upgrade: UpgradeInterface;
  setContext: (context: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
  closeModal: () => void;
  openModal: () => void;
  logout: () => void;
  openSettings: () => void;
};
