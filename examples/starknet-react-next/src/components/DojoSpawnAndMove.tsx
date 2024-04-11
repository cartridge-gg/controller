import {
  useAccount,
  useContractWrite,
  useExplorer,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import { TransactionFinalityStatus } from "starknet";

const worldAddress =
  "0x426bf51e62109e5c98e7d36dddf813881b610a1ff7c241e51ec3533ce58778c";
const actionsAddress =
  "0x6823753387c85935c6a3d141fb273e35ea9114a5f6e1c2b69d7c5bc3916c7f2";

type TransactionQueue = {
  action: "spawn" | "move";
  direction?: "up" | "down" | "left" | "right";
  hash?: string;
  error?: string;
};

export function DojoSpawnAndMove() {
  const { account } = useAccount();
  const explorer = useExplorer();
  const [queue, setQueue] = useState<TransactionQueue[]>([]);
  const { writeAsync: spawn } = useContractWrite({
    calls: [
      {
        contractAddress: actionsAddress,
        entrypoint: "spawn",
        calldata: [],
      },
    ],
  });

  const { writeAsync: move } = useContractWrite({
    calls: [
      {
        contractAddress: actionsAddress,
        entrypoint: "move",
        calldata: ["0x1"],
      },
    ],
  });

  if (!account) {
    return null;
  }

  return (
    <>
      <h2>Spawn And Move (Dojo example)</h2>
      <p>Actions Address: {actionsAddress}</p>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <button
          onClick={async () => {
            try {
              const { transaction_hash } = await spawn();
              if (!transaction_hash) {
                return;
              }

              await account
                .waitForTransaction(transaction_hash, {
                  successStates: [
                    TransactionFinalityStatus.ACCEPTED_ON_L1,
                    TransactionFinalityStatus.ACCEPTED_ON_L2,
                  ],
                })
                .then(() => {
                  setQueue([
                    ...queue,
                    { action: "spawn", hash: transaction_hash },
                  ]);
                });
            } catch (e) {
              setQueue([...queue, { action: "spawn", error: e.message }]);
            }
          }}
        >
          Spawn
        </button>
        <button
          onClick={async () => {
            try {
              const { transaction_hash } = await move();
              if (!transaction_hash) {
                return;
              }

              await account
                .waitForTransaction(transaction_hash, {
                  successStates: [
                    TransactionFinalityStatus.ACCEPTED_ON_L1,
                    TransactionFinalityStatus.ACCEPTED_ON_L2,
                  ],
                })
                .then(() => {
                  setQueue([
                    ...queue,
                    { action: "move", hash: transaction_hash },
                  ]);
                });
            } catch (e) {
              setQueue([...queue, { action: "move", error: e.message }]);
            }
          }}
        >
          Move Left
        </button>
      </div>
      {queue.map((txn, idx) => (
        <div
          key={txn.hash}
          style={{ display: "flex", flexDirection: "row", gap: "5px" }}
        >
          <p>
            {idx}. {txn.action} {txn.action === "move" ? txn.direction : ""}
          </p>
          <a
            href={explorer.transaction(txn.hash)}
            target="_blank"
            rel="noreferrer"
          >
            {txn.hash}
          </a>
          {txn.error && <p>{txn.error}</p>}
        </div>
      ))}
    </>
  );
}
