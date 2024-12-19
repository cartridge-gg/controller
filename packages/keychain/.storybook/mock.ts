import { constants } from "starknet";
import { getChainName } from "@cartridge/utils";
import Controller from "@cartridge/controller";
import { SessionPolicies } from "@cartridge/presets";
import { Parameters } from "@storybook/react";
import { ConnectionContextValue } from "../src/components/Provider/connection";
import { UpgradeInterface } from "../src/hooks/upgrade";
import { ConnectCtx, ConnectionCtx } from "../src/utils/connection/types";
import { defaultTheme } from "@cartridge/presets";

export interface StoryParameters extends Parameters {
  connection?: {
    context?: ConnectionCtx;
    controller?: Controller;
    chainId?: string;
    upgrade?: UpgradeInterface;
  };
  preset?: string;
  policies?: SessionPolicies;
}

export function useMockedConnection({
  chainId = constants.StarknetChainId.SN_SEPOLIA,
  context = {
    type: "connect",
    origin: "http://localhost:3002",
    policies: [],
    resolve: () => {},
    reject: () => {},
  } as ConnectCtx,
  ...rest
}: StoryParameters["connection"] = {}): ConnectionContextValue {
  const chainName = getChainName(chainId);

  return {
    context,
    origin: "http://localhost:3002",
    rpcUrl: "http://api.cartridge.gg/x/sepolia",
    chainId,
    chainName,
    policies: {},
    theme: defaultTheme,
    prefunds: [],
    hasPrefundRequest: false,
    error: undefined,
    setContext: () => {},
    setController: () => {},
    closeModal: () => {},
    openModal: () => {},
    logout: () => {},
    openSettings: () => {},
    controller: {},
    upgrade: {},
    ...rest,
  };
}
