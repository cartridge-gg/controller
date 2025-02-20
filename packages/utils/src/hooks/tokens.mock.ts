import { tokensByAddress, tokensBySymbol } from "@cartridge/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import * as actual from "./tokens";

export * from "./tokens";

export const useTokens: Mock<() => actual.UseTokensResponse> = fn(() => ({
  tokens: tokensByAddress,
  feeToken: tokensBySymbol.ETH,
  isLoading: false,
  register: () => {},
})).mockName("useTokens");

export const useToken: Mock<() => actual.UseTokenResponse> = fn(
  actual.useToken,
).mockName("useToken");
