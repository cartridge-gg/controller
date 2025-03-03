import { fn, Mock } from "@storybook/test";
import { accounts } from "@cartridge/utils/mock/data";
import { constants } from "starknet";
import { UIContextValue } from "#context";

export * from "./ui";

export const useUI: Mock<() => UIContextValue> = fn(() => ({
  account: accounts["test-0"],
  chainId: constants.StarknetChainId.SN_MAIN,
  closeModal: fn(),
  openSettings: fn(),
}));
