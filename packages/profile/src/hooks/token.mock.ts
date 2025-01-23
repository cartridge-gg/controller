import { tokens } from "@cartridge/utils/mock/data";

export function useTokens() {
  return {
    data: [tokens.ETH, tokens.STARK],
    isFetching: false,
    isLoading: false,
  };
}

export function useToken() {
  return tokens.ETH;
}
