"use client";

import { Button } from "@cartridge/ui-next";
import { useAccount, useExplorer } from "@starknet-react/core";
import { useCallback, useState } from "react";
import { ETH_CONTRACT_ADDRESS } from "./providers/StarknetProvider";

export const ManualTransferEth = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { account } = useAccount();
  const explorer = useExplorer();
  const [txnHash, setTxnHash] = useState<string>();

  const execute = useCallback(
    async (amount: string) => {
      if (!account) {
        return;
      }
      setSubmitted(true);
      setTxnHash(undefined);

      account
        .execute([
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "increaseAllowance",
            calldata: [account?.address, amount, "0x0"],
          },
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "transfer",
            calldata: [account?.address, amount, "0x0"],
          },
        ])
        .then(({ transaction_hash }) => setTxnHash(transaction_hash))
        .catch((e) => console.error(e))
        .finally(() => setSubmitted(false));
    },
    [account],
  );

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Manual Transfer Eth</h2>
      <p>Address: {ETH_CONTRACT_ADDRESS}</p>
      <Button onClick={() => execute("0x0")} disabled={submitted}>
        Transfer 0 ETH to self
      </Button>
      <Button onClick={() => execute("0x1C6BF52634000")} disabled={submitted}>
        Transfer 0.005 ETH to self
      </Button>
      <Button
        onClick={() => execute("1B1AE4D6E2EF500000")}
        disabled={submitted}
      >
        Transfer 500 ETH to self
      </Button>
      {txnHash && (
        <p>
          Transaction hash:{" "}
          <a
            href={explorer.transaction(txnHash)}
            target="_blank"
            rel="noreferrer"
          >
            {txnHash}
          </a>
        </p>
      )}
    </div>
  );
};
