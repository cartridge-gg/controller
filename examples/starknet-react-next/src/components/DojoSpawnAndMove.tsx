import {
  useAccount,
  useContractWrite,
  useExplorer,
} from "@starknet-react/core";
import { useState } from "react";

export const DOJO_ACTION_ADDRESS =
  "0x6823753387c85935c6a3d141fb273e35ea9114a5f6e1c2b69d7c5bc3916c7f2";

export function DojoSpawnAndMove() {
  const { account } = useAccount();
  const explorer = useExplorer();
  const [txnHash, setTxnHash] = useState<string>();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { writeAsync: spawn } = useContractWrite({
    calls: [
      {
        contractAddress: DOJO_ACTION_ADDRESS,
        entrypoint: "spawn",
        calldata: [],
      },
    ],
  });

  const { writeAsync: move } = useContractWrite({
    calls: [
      {
        contractAddress: DOJO_ACTION_ADDRESS,
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
      <p>Actions Address: {DOJO_ACTION_ADDRESS}</p>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <button
          onClick={async () => {
            setTxnHash(undefined);
            setSubmitted(true);
            spawn()
              .then(({ transaction_hash }) => setTxnHash(transaction_hash))
              .catch((e) => console.error(e))
              .finally(() => setSubmitted(false));
          }}
          disabled={submitted}
        >
          Spawn
        </button>
        <button
          onClick={async () => {
            setTxnHash(undefined);
            setSubmitted(true);
            move()
              .then(({ transaction_hash }) => setTxnHash(transaction_hash))
              .catch((e) => console.error(e))
              .finally(() => setSubmitted(false));
          }}
          disabled={submitted}
        >
          Move Left
        </button>
      </div>
      <div>
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
    </>
  );
}
