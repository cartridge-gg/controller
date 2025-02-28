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

export const mockedController = {
  address: fn(
    () => "0x0000000000000000000000000000000000000000000000000000000000000000",
  ),
  username: fn(() => "user"),
  chainId: fn(() => constants.StarknetChainId.SN_MAIN),
  provider: new RpcProvider({
    nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet",
  }),
  cartridge: {} as CartridgeAccount,
  cartridgeMeta: {} as CartridgeAccountMeta,
} as unknown as Controller;

export const mockedConnection: ConnectionContextValue = {
  context: {
    type: "connect",
    origin: "http://localhost:3002",
    policies: [],
    resolve: fn(),
    reject: fn(),
  } as ConnectCtx,
  controller: mockedController,
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

export const useConnectionValue: Mock<() => ConnectionContextValue> = fn(() => {
  return mockedConnection;
});

export const useConnection: Mock<() => ConnectionContextValue> = fn(
  () => mockedConnection,
);
