import { constants, RpcProvider } from "starknet";
import Controller from "@cartridge/controller";
import { controllerConfigs, SessionPolicies } from "@cartridge/presets";
import { Parameters } from "@storybook/react";
import { ConnectionContextValue } from "../src/components/provider/connection";
import { ConnectCtx, ConnectionCtx } from "../src/utils/connection/types";
import { defaultTheme } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui-next";
import {
  UpgradeContext,
  UpgradeProviderProps,
  UpgradeInterface,
  CONTROLLER_VERSIONS,
} from "../src/components/provider/upgrade";
import React from "react";

export interface StoryParameters extends Parameters {
  connection?: {
    context?: ConnectionCtx;
    controller?: Controller;
    chainId?: string;
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
      classHash: () =>
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      upgrade: () => Promise.resolve(),
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
    setContext: () => {},
    setController: () => {},
    closeModal: () => {},
    openModal: () => {},
    logout: () => {},
    openSettings: () => {},
    ...rest,
  };
}

const mockUpgradeValue: UpgradeInterface = {
  available: false,
  current: undefined,
  latest: CONTROLLER_VERSIONS[2],
  calls: [],
  isSynced: true, // This is the key value we need to set
  isUpgrading: false,
  error: undefined,
  onUpgrade: async () => {},
  isBeta: false,
};

export const MockUpgradeProvider: React.FC<UpgradeProviderProps> = ({
  children,
}) => {
  return (
    <UpgradeContext.Provider value={mockUpgradeValue}>
      {children}
    </UpgradeContext.Provider>
  );
};
