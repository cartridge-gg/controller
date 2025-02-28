import { Mock, fn } from "@storybook/test";
import { UseCreditBalanceReturn } from "./balance";

export * from "./balance";

export const useCreditBalance: Mock<() => UseCreditBalanceReturn> = fn(() => ({
  balance: {
    value: 1000000000000000000n,
    formatted: "$1.00",
  },
  isFetching: false,
  isLoading: false,
  error: null,
}));
