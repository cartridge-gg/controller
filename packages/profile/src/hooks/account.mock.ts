import { accounts } from "@cartridge/utils/mock";

export function useAccount() {
  const account = accounts[0];
  return {
    username: account.username,
    address: account.address,
  };
}

export function useAccountInfo() {
  const account = accounts[0];
  return {
    name: account.username,
    address: account.address,
    wallet: null,
    isFetching: false,
    error: "",
    warning: "",
  };
}
