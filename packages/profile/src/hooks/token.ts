import { useERC20Balance } from "@cartridge/utils";
import { useAccount } from "./account";
import { useConnection } from "./context";
import { getChecksumAddress } from "starknet";

export function useTokens(accountAddress?: string) {
  const { erc20: options, provider, isVisible } = useConnection();
  const { address } = useAccount();
  return useERC20Balance({
    address: accountAddress ?? address,
    contractAddress: options,
    provider,
    interval: isVisible ? 3000 : undefined,
  });
}

export function useToken({
  tokenAddress,
  accountAddress,
}: {
  accountAddress?: string;
  tokenAddress: string;
}) {
  const { data } = useTokens(accountAddress);
  return data.find(
    (t) =>
      getChecksumAddress(t.meta.address) === getChecksumAddress(tokenAddress),
  );
}
