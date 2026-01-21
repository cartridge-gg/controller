import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@/hooks/connection";
import * as torii from "@dojoengine/torii-wasm";
import Torii from "@/helpers/torii";

export type UseTokenContractResponse = {
  tokenContract: torii.TokenContract | undefined;
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export function useTokenContract({
  contractAddress,
}: {
  contractAddress?: string;
}): UseTokenContractResponse {
  const { project } = useConnection();
  const [tokenContract, setTokenContract] = useState<
    torii.TokenContract | undefined
  >(undefined);
  const [status, setStatus] = useState<
    "success" | "error" | "idle" | "loading"
  >("idle");
  const [trigger, setTrigger] = useState(true);
  const [client, setClient] = useState<torii.ToriiClient | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!project) return;
    Torii.getClient(project).then((client) => setClient(client));
  }, [project]);

  // console.log("COLLECTION", contractAddress?.slice(0, 10), tokenIds, address)

  useEffect(() => {
    if (!client || !trigger || !contractAddress) return;
    setTrigger(false);
    const getTokenContract = async () => {
      setTokenContract(undefined);
      setStatus("loading");
      try {
        const result = await Torii.fetchTokenContract(client, contractAddress);
        setTokenContract(result);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };
    getTokenContract();
  }, [client, trigger, project, contractAddress]);

  const refetch = useCallback(() => {
    setTrigger(true);
  }, [setTrigger]);

  return {
    tokenContract,
    status,
    refetch,
  };
}
