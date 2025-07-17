import { accounts } from "@cartridge/ui/utils/mock/data";
import { fn, Mock } from "@storybook/test";
import { UseAccountInfoResponse, UseAccountResponse } from "@/hooks/account";

export * from "./account";

export const useAccount: Mock<() => UseAccountResponse> = fn(() => ({
  username: accounts["test-0"].username,
  address: accounts["test-0"].address,
})).mockName("useAccount");

export const useAccountInfo: Mock<() => UseAccountInfoResponse> = fn(() => ({
  name: accounts["test-0"].username,
  address: accounts["test-0"].address,
  wallet: null,
  isFetching: false,
  error: "",
  warning: "",
})).mockName("useAccountInfo");
