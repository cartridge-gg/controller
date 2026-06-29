import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import { useConnection } from "@/hooks/connection";
import Torii from "@/helpers/torii";
import type { TokenTransfer } from "@dojoengine/torii-wasm";

export type Transfer = TokenTransfer;

export const useTransfers = (contractAddress: string, tokenId: string[]) => {
  const { toriiUrl } = useConnection();
  const [client, setClient] = useState<Awaited<
    ReturnType<typeof Torii.getClient>
  > | null>(null);

  useEffect(() => {
    if (!toriiUrl) return;
    Torii.getClient(toriiUrl).then(setClient);
  }, [toriiUrl]);

  const query = useQuery(
    ["transfers", contractAddress, tokenId, toriiUrl],
    async () => {
      if (!client) return [];
      const result = await Torii.fetchTransfers(
        client,
        [contractAddress],
        [], // No account filter
        tokenId,
        1000, // Limit
      );
      return result.items;
    },
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
      enabled: !!client && !!contractAddress && !!tokenId,
    },
  );

  return {
    data: query.data || [],
    status: query.status,
    isLoading: query.isLoading,
    error: query.error,
  };
};
