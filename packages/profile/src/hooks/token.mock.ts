import { tokens } from "@cartridge/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import { UseTokensResponse, UseTokenResponse } from "./token";
import { ERC20Balance } from "@cartridge/utils";

export * from "./token";

export const useTokens: Mock<() => UseTokensResponse> = fn(() => ({
  data: Object.values(tokens) as ERC20Balance[],
  isFetching: false,
  isLoading: false,
})).mockName("useTokens");

export const useToken: Mock<() => UseTokenResponse> = fn(
  () => tokens.ETH as ERC20Balance,
).mockName("useToken");
