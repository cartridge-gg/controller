import { ConnectionContextValue } from "#components/provider/connection";
import { ConnectCtx } from "#utils/connection/types";
import { defaultTheme } from "@cartridge/controller";
import {
  CartridgeAccount,
  CartridgeAccountMeta,
} from "@cartridge/account-wasm/controller";
import { fn, Mock } from "@storybook/test";
import { constants, RpcProvider } from "starknet";
import { ParsedSessionPolicies } from "./session";
import Controller from "#utils/controller";

export * from "./connection";

const defaultMockConnection: ConnectionContextValue = {
  context: {
    type: "connect",
    origin: "http://localhost:3002",
    policies: [],
    resolve: fn(),
    reject: fn(),
  } as ConnectCtx,
  controller: {
    address: fn(
      () =>
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    ),
    username: fn(() => "user"),
    chainId: fn(() => constants.StarknetChainId.SN_MAIN),
    provider: new RpcProvider({
      nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet",
    }),
    cartridge: {} as CartridgeAccount,
    cartridgeMeta: {} as CartridgeAccountMeta,
  } as unknown as Controller,
  origin: "http://localhost:3002",
  rpcUrl: "http://api.cartridge.gg/x/starknet/mainnet",
  policies: {} as ParsedSessionPolicies,
  theme: { ...defaultTheme, verified: true },
  hasPrefundRequest: false,
  setContext: fn(),
  setController: fn(),
  closeModal: fn(),
  openModal: fn(),
  logout: fn(),
  openSettings: fn(),
};

export function createMockConnection(
  // Better way to type this? Failed to implement `DeepPartial<UpgradeInterface>` type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overrides?: any,
) {
  return {
    ...defaultMockConnection,
    ...overrides,
    controller: {
      ...defaultMockConnection.controller,
      ...overrides?.controller,
    },
    context: {
      ...defaultMockConnection.context,
      ...overrides?.context,
    },
  };
}

export const useConnectionValue: Mock<() => ConnectionContextValue> = fn(
  () => defaultMockConnection,
);

export const useConnection: Mock<() => ConnectionContextValue> = fn(
  () => defaultMockConnection,
);
