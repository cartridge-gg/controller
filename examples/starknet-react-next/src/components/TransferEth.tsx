import { useAccount, useExplorer } from "@starknet-react/core";
import { useCallback, useState } from "react";

const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const TransferEth = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { account } = useAccount();
  const explorer = useExplorer();
  const [txnHash, setTxnHash] = useState<string>();

  const execute = useCallback(async () => {
    if (!account) {
      return;
    }
    setSubmitted(true);
    setTxnHash(undefined);

    account
      .execute([
        {
          contractAddress: ETH_CONTRACT,
          entrypoint: "approve",
          calldata: [account?.address, "0x11C37937E08000", "0x0"],
        },
        {
          contractAddress: ETH_CONTRACT,
          entrypoint: "transfer",
          calldata: [account?.address, "0x11C37937E08000", "0x0"],
        },
      ])
      .then(({ transaction_hash }) => setTxnHash(transaction_hash))
      .catch((e) => console.error(e))
      .finally(() => setSubmitted(false));
  }, [account]);

  if (!account) {
    return null;
  }

  return (
    <>
      <h2>Transfer Eth</h2>
      <p>Address: {ETH_CONTRACT}</p>

      <button onClick={() => execute()} disabled={submitted}>
        Transfer 0.005 ETH to self
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
    </>
  );
};
