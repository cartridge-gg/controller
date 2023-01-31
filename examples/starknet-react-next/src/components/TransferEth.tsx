import { useAccount, useStarknetExecute } from "@starknet-react/core";

const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const TransferEth = () => {
  const { account } = useAccount();
  const { execute } = useStarknetExecute({
    calls: [
      {
        contractAddress: ETH_CONTRACT,
        entrypoint: "approve",
        calldata: [account?.address, "0x16345785D8A0000", "0x0"],
      },
      {
        contractAddress: ETH_CONTRACT,
        entrypoint: "transfer",
        calldata: [account?.address, "0x16345785D8A0000", "0x0"],
      },
    ],
  });

  if (!account) {
    return null;
  }

  return (
    <>
      <h2>Transfer Eth</h2>
      <p>Address: {ETH_CONTRACT}</p>
      <button onClick={() => execute()}>Transfer 0.1 ETH to self</button>
    </>
  );
};
