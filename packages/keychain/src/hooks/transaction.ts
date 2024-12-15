import { useState, useEffect } from "react";
import { constants } from "starknet";
import { useSearchParams } from "react-router-dom";

export type Transaction = {
  name: string;
  hash: string;
};

export function useUrlTxns(): {
  chainId?: constants.StarknetChainId;
  txns: Transaction[];
} {
  const [searchParams] = useSearchParams();
  const [chainId, setChainId] = useState<constants.StarknetChainId>();
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    const chainId = searchParams.get("chainId");
    const raw = searchParams.get("txns");
    if (chainId) {
      setChainId(
        chainId
          ? (chainId as constants.StarknetChainId)
          : constants.StarknetChainId.SN_SEPOLIA,
      );
    }

    if (!raw) {
      return;
    }

    const res = JSON.parse(raw as string) as Transaction[];
    setTxns(res);
  }, [searchParams]);

  return {
    chainId,
    txns,
  };
}
