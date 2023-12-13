import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { constants } from "starknet";

export type Transaction = {
  name: string;
  hash: string;
};

export function useUrlTxns(): {
  chainId: constants.StarknetChainId;
  txns: Transaction[];
} {
  const router = useRouter();
  const [chainId, setChainId] = useState<constants.StarknetChainId>();
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    const { chainId, txns: raw } = router.query;
    if (!router.isReady) {
      return;
    }
    setChainId(
      chainId
        ? (chainId as constants.StarknetChainId)
        : constants.StarknetChainId.SN_GOERLI,
    );

    if (!raw) {
      return;
    }

    const res = JSON.parse(raw as string) as Transaction[];
    setTxns(res);
  }, [router.isReady, router.query]);

  return {
    chainId,
    txns,
  };
}
