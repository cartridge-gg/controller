import { accounts } from "@cartridge/utils/mock/data";
import { Decorator } from "@storybook/react";

let account = accounts["test-0"];
export const decorator: Decorator = (story, { parameters }) => {
  if (parameters?.account) {
    account = {
      ...account,
      ...parameters.account,
    };
  }

  return story();
};

export function useAccount() {
  return {
    username: account.username,
    address: account.address,
  };
}

export function useAccountInfo() {
  return {
    name: account.username,
    address: account.address,
    wallet: null,
    isFetching: false,
    error: "",
    warning: "",
  };
}
