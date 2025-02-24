import { accounts } from "@cartridge/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import { UseAccountInfoResponse, UseAccountResponse } from "#hooks/account";

export * from "./account";

export const useAccount = fn(() => ({
  username: accounts["test-0"].username,
  address: accounts["test-0"].address,
})).mockName("useAccount") as Mock<() => UseAccountResponse>; // TS doesn't infer the return type of the mock for some reason

export const useAccountInfo = fn(() => ({
  name: accounts["test-0"].username,
  address: accounts["test-0"].address,
  wallet: null,
  isFetching: false,
  error: "",
  warning: "",
})).mockName("useAccountInfo") as Mock<() => UseAccountInfoResponse>;
