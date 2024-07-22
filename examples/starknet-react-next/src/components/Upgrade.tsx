import { useAccount, useContractWrite } from "@starknet-react/core";

export function Upgrade() {
  const { account } = useAccount();

  const { write } = useContractWrite({
    calls: [
      {
        contractAddress:
          "0x6f5a2a7ee4b927a7785fc3cead195869ca689bdad58f57293c505979083d635",
        entrypoint: "upgrade",
        calldata: [
          "0x001b56dadc3c65ee04154686c32579760a7c72b33d21501ab207a1c7a06e2f35",
        ],
      },
    ],
  });

  if (!account) {
    return null;
  }

  return (
    <div>
      <button onClick={() => write()}>Upgrade</button>
    </div>
  );
}
