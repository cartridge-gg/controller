import { tokens } from "@cartridge/ui/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import { UseTokensResponse, UseTokenResponse, Token } from "./token";

export * from "./token";

export const credits = {
  balance: {
    amount: 1.234567,
    value: 0,
    change: 0,
  },
  metadata: {
    address: "credits",
    name: "Credits",
    symbol: "CREDITS",
    image: "https://static.cartridge.gg/presets/credit/icon.svg",
    decimals: 6,
  },
};

export const useTokens: Mock<() => UseTokensResponse> = fn(() => ({
  tokens: Object.values(tokens) as Token[],
  contracts: [],
  credits: credits,
  status: "success" as const,
})).mockName("useTokens");

export const useToken: Mock<() => UseTokenResponse> = fn(() => ({
  token: tokens.ETH as Token,
  status: "success" as const,
})).mockName("useToken");
