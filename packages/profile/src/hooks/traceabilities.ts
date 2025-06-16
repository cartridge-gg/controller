import { useMemo, useState } from "react";
import {
  TraceabilityProject,
  useTraceabilitiesQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useConnection } from "./context";
import { formatAddress, getDate } from "@cartridge/ui/utils";
import { useUsernames } from "./account";
import { addAddressPadding, getChecksumAddress } from "starknet";

const LIMIT = 0;

export interface CardProps {
  key: string;
  contractAddress: string;
  transactionHash: string;
  amount: number;
  username: string;
  image: string;
  title: string;
  category: "send" | "receive" | "mint" | "sale" | "list";
  timestamp: number;
  date: string;
  points?: number;
  currencyImage?: string;
}

export type Traceability = {
  project: string;
  amount: number;
  contractAddress: string;
  decimals: number;
  eventId: string;
  executedAt: string;
  fromAddress: string;
  toAddress: string;
  metadata: string;
  name: string;
  symbol: string;
  tokenId: string;
  transactionHash: string;
};

interface TraceabilitiesProps {
  contractAddress: string;
  tokenId: string;
}

export type UseTraceabilitiesResponse = {
  traceabilities: CardProps[];
  status: "success" | "error" | "idle" | "loading";
};

export function useTraceabilities({
  contractAddress,
  tokenId,
}: TraceabilitiesProps): UseTraceabilitiesResponse {
  const { project } = useConnection();
  const [traceabilities, setTraceabilities] = useState<{
    [key: string]: Traceability;
  }>({});

  const projects: TraceabilityProject[] = useMemo(() => {
    if (!contractAddress || !tokenId) return [];
    return [
      {
        project: project ?? "",
        date: "",
        contractAddress: contractAddress,
        tokenId: tokenId,
        limit: LIMIT,
      },
    ];
  }, [project, tokenId, contractAddress]);

  const { status } = useTraceabilitiesQuery(
    {
      projects,
    },
    {
      queryKey: ["traceabilities", projects],
      enabled: projects.length > 0,
      onSuccess: ({ traceabilities }) => {
        const newTraceabilities: { [key: string]: Traceability } = {};
        traceabilities?.items.forEach((item) => {
          item.transfers.forEach(
            ({
              amount,
              contractAddress,
              decimals,
              eventId,
              executedAt,
              fromAddress,
              toAddress,
              metadata,
              name,
              symbol,
              tokenId,
              transactionHash,
            }) => {
              const key = `${transactionHash}-${eventId}`;
              const traceability: Traceability = {
                project: item.meta.project,
                amount: Number(amount),
                contractAddress,
                decimals: Number(decimals),
                eventId,
                executedAt,
                fromAddress,
                toAddress,
                metadata,
                name,
                symbol,
                tokenId,
                transactionHash,
              };
              newTraceabilities[key] = traceability;
            },
          );
        });
        setTraceabilities(newTraceabilities);
      },
    },
  );

  const addresses = useMemo(() => {
    return Object.values(traceabilities).flatMap((traceability) => [
      `0x${BigInt(traceability.fromAddress).toString(16)}`,
      `0x${BigInt(traceability.toAddress).toString(16)}`,
    ]);
  }, [traceabilities]);

  const { usernames } = useUsernames({ addresses });

  const transfers: CardProps[][] = useMemo(() => {
    const results = Object.values(traceabilities).map((traceability) => {
      const timestamp = new Date(traceability.executedAt).getTime();
      const date = getDate(timestamp);
      const from = `0x${BigInt(traceability.fromAddress).toString(16)}`;
      const fromName =
        usernames.find((username) => username.address === from)?.username ??
        formatAddress(getChecksumAddress(from), {
          size: "xs",
        });
      const to = `0x${BigInt(traceability.toAddress).toString(16)}`;
      const toName =
        usernames.find((username) => username.address === to)?.username ??
        formatAddress(getChecksumAddress(to), {
          size: "xs",
        });
      const image = `https://api.cartridge.gg/x/${traceability.project}/torii/static/0x${BigInt(traceability.contractAddress).toString(16)}/${addAddressPadding(traceability.tokenId)}/image`;
      const sender = {
        key: `${traceability.transactionHash}-${traceability.eventId}`,
        contractAddress: traceability.contractAddress,
        transactionHash: traceability.transactionHash,
        amount: traceability.amount,
        username: fromName,
        image: image,
        category: "send",
        timestamp: timestamp / 1000,
        date: date,
        title: traceability.name,
      } as CardProps;
      const receiver = {
        key: `${traceability.transactionHash}-${traceability.eventId}`,
        contractAddress: traceability.contractAddress,
        transactionHash: traceability.transactionHash,
        amount: traceability.amount,
        username: toName,
        image: image,
        category: BigInt(traceability.fromAddress) === 0n ? "mint" : "receive",
        timestamp: timestamp / 1000,
        date: date,
        title: traceability.name,
      } as CardProps;
      if (BigInt(traceability.fromAddress) === 0n) {
        return [receiver];
      }
      return [receiver, sender];
    });
    return results;
  }, [traceabilities, usernames]);

  return { traceabilities: transfers.flat(), status };
}
