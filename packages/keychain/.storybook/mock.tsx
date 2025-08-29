import Controller, { ResponseCodes } from "@cartridge/controller";
import { defaultTheme, SessionPolicies } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui";
import { Parameters } from "@storybook/react";
import React from "react";
import { constants, RpcProvider } from "starknet";
import { ConnectionContextValue } from "../src/components/provider/connection";
import {
  CONTROLLER_VERSIONS,
  UpgradeContext,
  UpgradeInterface,
  UpgradeProviderProps,
} from "../src/components/provider/upgrade";
import { ConnectCtx, ConnectionCtx } from "../src/utils/connection/types";
import { SemVer } from "semver";

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
    ? parameters.preset === "default"
      ? defaultTheme
      : defaultTheme // We'll use default theme since we can't load dynamically in this mock
    : defaultTheme;

  useThemeEffect({
    theme,
    assetUrl: "",
  });

  return {
    parent: undefined,
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
        nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
      }),
      ...controller,
    },
    origin: "http://localhost:3002",
    rpcUrl: "http://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9",
    policies: {},
    theme: { ...theme, verified: true },
    isConfigLoading: false,
    controllerVersion: new SemVer("1.0.0"),
    verified: true,
    setContext: () => {},
    setController: () => {},
    closeModal: () => Promise.resolve(),
    openModal: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    openSettings: () => {},
    externalDetectWallets: () => Promise.resolve([]),
    externalConnectWallet: () =>
      Promise.resolve({
        success: true,
        wallet: "metamask",
        result: { code: ResponseCodes.SUCCESS, message: "Success" },
        account: "0x0000000000000000000000000000000000000000",
      }),
    externalSignMessage: () =>
      Promise.resolve({
        success: true,
        wallet: "metamask",
        result: { code: ResponseCodes.SUCCESS, message: "Success" },
        account: "0x0000000000000000000000000000000000000000",
      }),
    externalSignTypedData: () =>
      Promise.resolve({
        success: true,
        wallet: "metamask",
        result: { code: ResponseCodes.SUCCESS, message: "Success" },
        account: "0x0000000000000000000000000000000000000000",
      }),
    externalSendTransaction: () =>
      Promise.resolve({
        success: true,
        wallet: "metamask",
        result: { code: ResponseCodes.SUCCESS, message: "Success" },
        account: "0x0000000000000000000000000000000000000000",
      }),
    externalGetBalance: () =>
      Promise.resolve({
        success: true,
        wallet: "metamask",
        result: { code: ResponseCodes.SUCCESS, message: "Success" },
        account: "0x0000000000000000000000000000000000000000",
      }),
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
