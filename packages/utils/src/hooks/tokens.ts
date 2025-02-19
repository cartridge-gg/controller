import { useContext } from "react";
import { ERC20, TokensContext, TokensContextValue } from "../context/tokens";
import { getChecksumAddress } from "starknet";

export type UseTokensResponse = TokensContextValue;

export function useTokens(): UseTokensResponse {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokensProvider");
  }

  return context;
}

export type UseTokenResponse =
  | {
      token: ERC20;
      isLoading: boolean;
      error?: Error;
    }
  | undefined;

export function useToken(address: string): UseTokenResponse {
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
