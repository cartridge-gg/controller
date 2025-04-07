import { tokens } from "@cartridge/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import { UseTokensResponse, UseTokenResponse, Token } from "./token";

export * from "./token";

export const useTokens: Mock<() => UseTokensResponse> = fn(() => ({
  tokens: Object.values(tokens) as Token[],
  status: "success" as const,
})).mockName("useTokens");

export const useToken: Mock<() => UseTokenResponse> = fn(() => ({
  token: tokens.ETH as Token,
  status: "success" as const,
})).mockName("useToken");
