import { useAccount, useContractWrite } from "@starknet-react/core";

export function InvalidTxn() {
  const { account } = useAccount();
  const { write } = useContractWrite({
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
    <>
      <h2>Invalid Entry Point</h2>
      <div>
        <button onClick={() => write()}>Invalid Entrypoint</button>
      </div>
    </>
  );
}
