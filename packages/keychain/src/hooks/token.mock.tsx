import { tokens } from "@cartridge/controller-ui/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import { UseTokensResponse, UseTokenResponse, Token } from "./token";
import { UsdColorIcon } from "@cartridge/controller-ui";

export * from "./token";

export const credits = {
  balance: {
    amount: 1.234567,
    value: 0,
    change: 0,
  },
  metadata: {
    address: "credits",
    name: "USD",
    symbol: "USD",
    image: <UsdColorIcon size="auto" />,
    decimals: 8,
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
