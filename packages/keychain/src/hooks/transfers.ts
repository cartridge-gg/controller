import { useQuery } from "react-query";
import { useMemo } from "react";
import { useConnection } from "@/hooks/connection";
import { addAddressPadding } from "starknet";

export type Transfer = {
  amount: string;
  decimals: number;
  metadata: string;
  name: string;
  symbol: string;
  tokenId: string;
  contractAddress: string;
  executedAt: string;
  fromAddress: string;
  toAddress: string;
  eventId: string;
  transactionHash: string;
};

const executeSqlQuery = async (
  toriiUrl: string,
  collectionAddress: string,
  tokenId: string,
): Promise<Transfer[]> => {
  const sqlQuery = `
    SELECT
      Transfers.amount,
      Tokens.decimals,
      Tokens.metadata,
      Tokens.name,
      Tokens.symbol,
      Tokens.token_id AS tokenId,
      Transfers.contract_address AS contractAddress,
      Transfers.executed_at AS executedAt,
      Transfers.from_address AS fromAddress,
      Transfers.to_address AS toAddress,
      substr(substr(Transfers.event_id, instr(Transfers.event_id, ':') + 1), instr(substr(Transfers.event_id, instr(Transfers.event_id, ':') + 1), ':') + 1) AS eventId,
      substr(substr(Transfers.event_id, instr(Transfers.event_id, ':') + 1), 1, instr(substr(Transfers.event_id, instr(Transfers.event_id, ':') + 1), ':') - 1) AS transactionHash
    FROM token_transfers AS Transfers
    JOIN tokens AS Tokens ON Transfers.token_id = Tokens.id
    WHERE 1 = 1
    AND contractAddress = '${addAddressPadding(collectionAddress)}'
    AND tokenId = '${addAddressPadding(tokenId)}'
    ORDER BY Transfers.id DESC
    LIMIT 1000;
  `;

  const response = await fetch(`${toriiUrl}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: sqlQuery,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SQL query failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data || [];
};

export const useTransfers = (contractAddress: string, tokenId: string) => {
  const { project } = useConnection();

  const toriiUrl = useMemo(() => {
    return `https://api.cartridge.gg/x/${project}/torii`;
  }, [project]);

  const query = useQuery(
    ["transfers", contractAddress, tokenId],
    async () => {
      return await executeSqlQuery(toriiUrl, contractAddress, tokenId);
    },
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
      enabled: !!toriiUrl && !!contractAddress && !!tokenId,
    },
  );

  return {
    data: query.data || [],
    status: query.status,
    isLoading: query.isLoading,
    error: query.error,
  };
};
