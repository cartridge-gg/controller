import { constants, RpcProvider } from "starknet";
import Controller from "@cartridge/controller";
import { controllerConfigs, SessionPolicies } from "@cartridge/presets";
import { Parameters } from "@storybook/react";
import { ConnectionContextValue } from "../src/components/provider/connection";
import { UpgradeInterface } from "../src/hooks/upgrade";
import { ConnectCtx, ConnectionCtx } from "../src/utils/connection/types";
import { defaultTheme } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui-next";

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

export function useMockedConnection(
  parameters: StoryParameters = {},
): ConnectionContextValue {
  const {
    chainId = constants.StarknetChainId.SN_MAIN,
    context = {
      type: "connect",
      origin: "http://localhost:3002",
      policies: [],
      resolve: () => {},
      reject: () => {},
    } as ConnectCtx,
    controller,
    ...rest
  } = parameters.connection ?? {};
  const theme = parameters.preset
    ? (controllerConfigs[parameters.preset].theme ?? defaultTheme)
    : defaultTheme;

  useThemeEffect({
    theme,
    assetUrl: "",
  });

  return {
    context,
    controller: {
      address: () =>
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      username: () => "user",
      chainId: () => chainId,
      provider: new RpcProvider({
        nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia",
      }),
      ...controller,
    },
    origin: "http://localhost:3002",
    rpcUrl: "http://api.cartridge.gg/x/starknet/mainnet",
    policies: {},
    theme: { ...theme, verified: true },
    hasPrefundRequest: false,
    setContext: () => {},
    setController: () => {},
    closeModal: () => {},
    openModal: () => {},
    logout: () => {},
    openSettings: () => {},
    upgrade: {},
    ...rest,
  };
}
