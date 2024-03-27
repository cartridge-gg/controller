import { useAccount, useContractWrite } from "@starknet-react/core";

const worldAddress =
  "0x426bf51e62109e5c98e7d36dddf813881b610a1ff7c241e51ec3533ce58778c";
const actionsAddress =
  "0x6823753387c85935c6a3d141fb273e35ea9114a5f6e1c2b69d7c5bc3916c7f2";

export function DojoSpawnAndMove() {
  const { account } = useAccount();
  const { write: spawn } = useContractWrite({
    calls: [
      {
        contractAddress: actionsAddress,
        entrypoint: "spawn",
        calldata: [],
      },
    ],
  });

  const { write: move } = useContractWrite({
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
        <button onClick={() => spawn()}>Spawn</button>
        <button onClick={() => move()}>Move Left</button>
      </div>
    </>
  );
}
