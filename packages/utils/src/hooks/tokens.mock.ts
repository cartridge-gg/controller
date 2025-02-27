import { tokensByAddress, tokensBySymbol } from "@cartridge/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import * as actual from "./tokens";
import { getChecksumAddress } from "starknet";

export * from "./tokens";

export const useTokens: Mock<() => actual.UseTokensResponse> = fn(() => ({
  tokens: tokensByAddress,
  feeToken: tokensBySymbol.ETH,
  isLoading: false,
  register: () => {},
})).mockName("useTokens");

export const useToken: Mock<(address: string) => actual.UseTokenResponse> = fn(
  (address) => {
    const { tokens, isLoading, error } = useTokens();
    const token = tokens[getChecksumAddress(address)];

    return {
      token,
      isLoading,
      error,
    };
  },
).mockName("useToken");

export const useFeeToken: Mock<() => actual.UseFeeTokenResponse> = fn(() => {
  const { feeToken, isLoading, error } = useTokens();
  return {
    token: feeToken,
    isLoading,
    error,
  };
}).mockName("useFeeToken");
