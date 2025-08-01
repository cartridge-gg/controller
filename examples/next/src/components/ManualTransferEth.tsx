"use client";

import { Button } from "@cartridge/ui";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useState } from "react";
import { ETH_CONTRACT_ADDRESS } from "./providers/StarknetProvider";
import { Call } from "starknet";

export const ManualTransferEth = () => {
  const { account } = useAccount();
  const { chain } = useNetwork();
  const [txnHash, setTxnHash] = useState<string>();
  const [network, setNetwork] = useState<string>();

  const execute = useCallback(
    async (amount: string) => {
      if (!account) {
        return;
      }
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
        .then(({ transaction_hash }) => {
          console.log("transaction_hash", transaction_hash);
          setTxnHash(transaction_hash);
          setNetwork(chain.network);
        })
        .catch((e) => console.error(e));
    },
    [account, chain],
  );

  const openStandaloneTransfer = useCallback(
    (amount: string) => {
      if (!account) {
        return;
      }

      const transactions: Call[] = [
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "increaseAllowance",
          calldata: [account.address, amount, "0x0"],
        },
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "transfer",
          calldata: [account.address, amount, "0x0"],
        },
      ];

      // Create manual execute URL by encoding the transaction data (no ID needed for standalone)
      const executeParams = {
        transactions,
      };

      const paramString = encodeURIComponent(JSON.stringify(executeParams));
      const executeUrl = `/execute?data=${paramString}`;

      // Always use current RPC URL to maintain chain context
      const rpcUrlParam = `&rpc_url=${encodeURIComponent(chain.rpcUrls.public.http[0] || "")}`;
      const fullUrl = `http://localhost:3001${executeUrl}${rpcUrlParam}`;

      window.open(fullUrl, "_blank");
    },
    [account, chain],
  );

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Manual Transfer Eth</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">
            Direct Execution (Same Tab)
          </h3>
          <div className="flex flex-wrap gap-1">
            <Button onClick={() => execute("0x0")}>
              Transfer 0 ETH to self
            </Button>
            <Button onClick={() => execute("0x1C6BF52634000")}>
              Transfer 0.005 ETH to self
            </Button>
            <Button onClick={() => execute("1B1AE4D6E2EF500000")}>
              Transfer 500 ETH to self
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">
            Standalone Transfer (New Tab)
          </h3>
          <div className="flex flex-wrap gap-1">
            <Button onClick={() => openStandaloneTransfer("0x0")}>
              Transfer 0 ETH to self
            </Button>
            <Button onClick={() => openStandaloneTransfer("0x1C6BF52634000")}>
              Transfer 0.005 ETH to self
            </Button>
            <Button
              onClick={() => openStandaloneTransfer("1B1AE4D6E2EF500000")}
            >
              Transfer 500 ETH to self
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Opens keychain execute page directly at localhost:3001/execute with
            current RPC URL ({chain.name})
          </p>
        </div>

        {txnHash && (
          <div>
            <p>Transaction: {txnHash}</p>
            <p>Chain: {network}</p>
          </div>
        )}
      </div>
    </div>
  );
};
