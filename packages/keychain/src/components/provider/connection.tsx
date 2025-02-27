import { createContext } from "react";
import Controller from "#utils/controller";
import { ConnectionCtx } from "#utils/connection";
import { ParsedSessionPolicies } from "#hooks/session";
import { ControllerTheme } from "@cartridge/ui-next";

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
  setContext: (context: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
  closeModal: () => void;
  openModal: () => void;
  logout: () => void;
  openSettings: () => void;
};

export type VerifiableControllerTheme = ControllerTheme & {
  verified: boolean;
};
