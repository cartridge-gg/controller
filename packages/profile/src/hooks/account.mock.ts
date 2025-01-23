export function useAccount() {
  return {
    username: "test-0",
    address:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  };
}

export function useAccountInfo() {
  return {
    name: "test-0",
    address:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    wallet: null,
    isFetching: false,
    error: "",
    warning: "",
  };
}
