import { Provider, uint256 } from "starknet";

export async function balanceOf({
  accountAddress,
  tokenAddress,
  provider,
}: {
  accountAddress: string;
  tokenAddress: string;
  provider: Provider;
}) {
  try {
    const balance = await provider.callContract({
      contractAddress: tokenAddress,
      entrypoint: "balance_of",
      calldata: [accountAddress],
    });

    return uint256
      .uint256ToBN({
        low: balance[0],
        high: balance[1],
      })
      .toString();
  } catch {
    throw new Error(
      `Failed to fetch balance for account: ${accountAddress}, token: ${tokenAddress}`,
    );
  }
}
