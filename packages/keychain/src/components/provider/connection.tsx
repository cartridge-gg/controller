import { createContext } from "react";
import { ConnectionCtx } from "@/utils/connection";
import { ParsedSessionPolicies } from "@/hooks/session";
import { VerifiableControllerTheme } from "@/context/theme";

export const ConnectionContext = createContext<
  ConnectionContextValue | undefined
>(undefined);

export type ConnectionContextValue = {
  context: ConnectionCtx;
  origin?: string;
  rpcUrl?: string;
  chainId?: string;
  chainName?: string;
  policies?: ParsedSessionPolicies;
  theme: VerifiableControllerTheme;
  hasPrefundRequest: boolean;
  error?: Error;
  setContext: (context: ConnectionCtx) => void;
  closeModal: () => void;
  openModal: () => void;
  logout: () => void;
  openSettings: () => void;
};
