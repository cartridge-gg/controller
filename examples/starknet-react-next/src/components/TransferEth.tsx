import { useAccount, useStarknetExecute } from "@starknet-react/core";

const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const TransferEth = () => {
  const { account } = useAccount();
  const { execute: executePointOne } = useStarknetExecute({
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
  const { execute: executeOne } = useStarknetExecute({
    calls: [
      {
        contractAddress: ETH_CONTRACT,
        entrypoint: "approve",
        calldata: [account?.address, "0xde0b6b3a7640000", "0x0"],
      },
      {
        contractAddress: ETH_CONTRACT,
        entrypoint: "transfer",
        calldata: [account?.address, "0xde0b6b3a7640000", "0x0"],
      },
    ],
  });
  const { execute: execute005 } = useStarknetExecute({
    calls: [
      {
        contractAddress: ETH_CONTRACT,
        entrypoint: "approve",
        calldata: [account?.address, "0x11C37937E08000", "0x0"],
      },
      {
        contractAddress: ETH_CONTRACT,
        entrypoint: "transfer",
        calldata: [account?.address, "0x11C37937E08000", "0x0"],
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
      <button onClick={() => execute005()}>Transfer 0.005 ETH to self</button>
      <button style={{marginLeft: "10px"}} onClick={() => executePointOne()}>Transfer 0.1 ETH to self</button>
      <button style={{marginLeft: "10px"}} onClick={() => executeOne()}>Transfer 1.0 ETH to self</button>
    </>
  );
};
