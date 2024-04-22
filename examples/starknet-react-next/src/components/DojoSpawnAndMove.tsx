import {
  useAccount,
  useContractWrite,
  useExplorer,
} from "@starknet-react/core";
import { useState } from "react";

// const worldAddress =
//   "0x426bf51e62109e5c98e7d36dddf813881b610a1ff7c241e51ec3533ce58778c";
const actionsAddress =
  "0x6823753387c85935c6a3d141fb273e35ea9114a5f6e1c2b69d7c5bc3916c7f2";

export function DojoSpawnAndMove() {
  const { account } = useAccount();
  const explorer = useExplorer();
  const [txnHash, setTxnHash] = useState<string>();
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
            setTxnHash(undefined);
            const { transaction_hash } = await spawn();
            setTxnHash(transaction_hash);
          }}
        >
          Spawn
        </button>
        <button
          onClick={async () => {
            setTxnHash(undefined);
            const { transaction_hash } = await move();
            setTxnHash(transaction_hash);
          }}
        >
          Move Left
        </button>
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
