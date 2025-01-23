import { tokens } from "@cartridge/utils/mock/data";

export function useTokens() {
  return {
    data: Object.values(tokens),
    isFetching: false,
    isLoading: false,
  };
}

export function useToken() {
  return tokens.ETH;
}
