"use client";

import { Button } from "@cartridge/ui";
import { useAccount, useSendTransaction } from "@starknet-react/core";

const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function InvalidTxn() {
  const { account } = useAccount();
  const { send: invalidEntrypoint } = useSendTransaction({
    calls: [
      {
        contractAddress:
          "0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1",
        entrypoint: "entrypointDoesNotExist",
        calldata: ["0x1"],
      },
    ],
  });

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Invalid Entry Point</h2>

      <div className="flex flex-wrap gap-1">
        <Button
          onClick={() =>
            account.execute([
              {
                contractAddress: ETH_CONTRACT,
                entrypoint: "approve",
                calldata: [],
              },
            ])
          }
        >
          Invalid Session Invoke Calldata
        </Button>
        <Button
          onClick={() => {
            account.execute([
              {
                contractAddress: ETH_CONTRACT,
                entrypoint: "register_governance_admin",
                calldata: [],
              },
            ]);
          }}
        >
          Invalid Manual Invoke Calldata
        </Button>
        <Button onClick={() => invalidEntrypoint()}>Invalid Entrypoint</Button>
        <Button
          onClick={() =>
            account.execute(
              [
                {
                  contractAddress: ETH_CONTRACT,
                  entrypoint: "approve",
                  calldata: [account.address, "0x0", "0x0"],
                },
              ],
              { maxFee: 1000000000000000000n },
            )
          }
        >
          Manual high fee
        </Button>
      </div>
    </div>
  );
}
