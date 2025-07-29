import { useState, useEffect } from "react";
import { constants } from "starknet";
import { useLocalSearchParams } from "expo-router";

export type Transaction = {
  name: string;
  hash: string;
};

export function useUrlTxns(): {
  chainId?: constants.StarknetChainId;
  txns: Transaction[];
} {
  const searchParams = useLocalSearchParams();
  const [chainId, setChainId] = useState<constants.StarknetChainId>();
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    const chainIdParam = searchParams.chainId as string;
    const raw = searchParams.txns as string;
    if (chainIdParam) {
      setChainId(
        chainIdParam
          ? (chainIdParam as constants.StarknetChainId)
          : constants.StarknetChainId.SN_SEPOLIA,
      );
    }

    if (!raw) {
      return;
    }

    const res = JSON.parse(raw) as Transaction[];
    setTxns(res);
  }, [searchParams]);

  return {
    chainId,
    txns,
  };
}
