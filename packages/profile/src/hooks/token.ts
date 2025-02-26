import {
  ERC20Balance,
  useERC20Balance,
  UseERC20BalanceResponse,
} from "@cartridge/utils";
import { useAccount } from "./account";
import { useConnection } from "./context";
import { getChecksumAddress } from "starknet";

export type UseTokensResponse = UseERC20BalanceResponse;

export function useTokens(accountAddress?: string): UseTokensResponse {
  const { erc20: options, provider, isVisible } = useConnection();
  const { address } = useAccount();
  return useERC20Balance({
    address: accountAddress ?? address,
    contractAddress: options,
    provider,
    interval: isVisible ? 3000 : undefined,
  });
}

export type UseTokenResponse = ERC20Balance | undefined;

export function useToken({
  tokenAddress,
  accountAddress,
}: {
  accountAddress?: string;
  tokenAddress: string;
}): UseTokenResponse {
  const { data } = useTokens(accountAddress);
  return data.find(
    (t) =>
      getChecksumAddress(t.meta.address) === getChecksumAddress(tokenAddress),
  );
}
