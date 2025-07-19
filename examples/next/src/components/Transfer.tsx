"use client";

import { Button } from "@cartridge/ui";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useState } from "react";
import { STRK_CONTRACT_ADDRESS } from "./providers/StarknetProvider";

export const Transfer = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { account } = useAccount();
  const { chain } = useNetwork();
  const [txnHash, setTxnHash] = useState<string>();
  const [network, setNetwork] = useState<string>();

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
            contractAddress: STRK_CONTRACT_ADDRESS,
            entrypoint: "approve",
            calldata: [account?.address, amount, "0x0"],
          },
          {
            contractAddress: STRK_CONTRACT_ADDRESS,
            entrypoint: "transfer",
            calldata: [account?.address, amount, "0x0"],
          },
        ])
        .then(({ transaction_hash }) => {
          setTxnHash(transaction_hash);
          setNetwork(chain.network);
        })
        .catch((e) => console.error(e))
        .finally(() => setSubmitted(false));
    },
    [account, chain],
  );

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Session Transfer STRK</h2>

      <div className="flex flex-wrap gap-1">
        <Button onClick={() => execute("0x0")}>Transfer 0 STRK to self</Button>
        <Button onClick={() => execute("0x1C6BF52634000")} disabled={submitted}>
          Transfer 0.005 STRK to self
        </Button>
        <Button
          onClick={() => execute("1B1AE4D6E2EF500000")}
          disabled={submitted}
        >
          Transfer 500 STRK to self
        </Button>
        {txnHash && (
          <>
            <p>Transaction: {txnHash}</p>
            <p>Chain: {network}</p>
          </>
        )}
      </div>
    </div>
  );
};
