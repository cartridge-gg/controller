import { tokens } from "@cartridge/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import { UseTokensResponse, UseTokenResponse } from "./tokens";
import { ERC20 } from "../context/tokens";

export * from "./tokens";

export const useTokens: Mock<() => UseTokensResponse> = fn(() => ({
  tokens: Object.fromEntries(
    Object.values(tokens).map((token) => [token.address, token]),
  ) as Record<string, ERC20>,
  isLoading: false,
  register: () => {},
})).mockName("useTokens");

export const useToken: Mock<() => UseTokenResponse> = fn(() => ({
  token: tokens.ETH as ERC20,
  isLoading: false,
})).mockName("useToken");
