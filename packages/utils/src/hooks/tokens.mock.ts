import { TokensContextValue } from "src/context/tokens";
import { getChecksumAddress } from "starknet";
import { tokensByAddress } from "@cartridge/utils/mock/data";

export function useTokens(): TokensContextValue {
  return {
    tokens: tokensByAddress,
    isLoading: false,
    register: () => {},
  };
}

export function useToken(address: string) {
  const { tokens, isLoading, error } = useTokens();
  const token = tokens[getChecksumAddress(address)];

  return {
    token,
    isLoading,
    error,
  };
}

export function useFeeToken() {
  const { feeToken, isLoading, error } = useTokens();
  return {
    token: feeToken,
    isLoading,
    error,
  };
}
