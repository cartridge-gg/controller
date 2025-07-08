import { useMemo, useState } from "react";
import {
  TraceabilityProject,
  useTraceabilitiesQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { formatAddress } from "@cartridge/ui/utils";
import { useUsernames } from "./account";
import { getChecksumAddress } from "starknet";
import { useMarketplace } from "./marketplace";
import { erc20Metadata } from "@cartridge/presets";
import { useProfileContext } from "./profile";

const LIMIT = 0;

export interface CardProps {
  key: string;
  contractAddress: string;
  transactionHash: string;
  amount: number;
  username: string;
  category: "send" | "receive" | "mint" | "sale" | "list";
  timestamp: number;
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
  const { sales: salesData, listings: listingsData } = useMarketplace();
  const { project } = useProfileContext();
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

  const sales: CardProps[] = useMemo(() => {
    if (!contractAddress || !tokenId) return [];
    const collectionSales = salesData[getChecksumAddress(contractAddress)];
    if (!collectionSales) return [];
    const tokenSales = collectionSales[`${BigInt(tokenId).toString()}`];
    if (!tokenSales) return [];
    return Object.values(tokenSales).map((sale) => {
      const username = usernames.find(
        (username) => BigInt(username.address ?? "0x0") === BigInt(sale.from),
      )?.username;
      const token = erc20Metadata.find(
        (metadata) =>
          BigInt(metadata.l2_token_address) === BigInt(sale.order.currency),
      );
      const currencyImage = token?.logo_url;
      const decimals = token?.decimals;
      const amount = sale.order.price / 10 ** (decimals || 0);
      return {
        key: `${sale.order.id}`,
        contractAddress: contractAddress,
        transactionHash: contractAddress,
        amount: amount,
        username: username,
        category: "sale",
        timestamp: sale.time,
        currencyImage: currencyImage,
      } as CardProps;
    });
  }, [salesData, usernames, project, contractAddress, tokenId]);

  const listings: CardProps[] = useMemo(() => {
    if (!contractAddress || !tokenId) return [];
    const collectionListings =
      listingsData[getChecksumAddress(contractAddress)];
    if (!collectionListings) return [];
    const tokenListings = collectionListings[`${BigInt(tokenId).toString()}`];
    if (!tokenListings) return [];
    return Object.values(tokenListings).map((listing) => {
      const username = usernames.find(
        (username) =>
          BigInt(username.address ?? "0x0") === BigInt(listing.order.owner),
      )?.username;
      const token = erc20Metadata.find(
        (metadata) =>
          BigInt(metadata.l2_token_address) === BigInt(listing.order.currency),
      );
      const currencyImage = token?.logo_url;
      const decimals = token?.decimals;
      const amount = listing.order.price / 10 ** (decimals || 0);
      return {
        key: `${listing.order.id}`,
        contractAddress: contractAddress,
        transactionHash: contractAddress,
        amount: amount,
        username: username,
        category: "list",
        timestamp: listing.time,
        currencyImage: currencyImage,
      } as CardProps;
    });
  }, [salesData, usernames, project, contractAddress, tokenId]);

  const transfers: CardProps[][] = useMemo(() => {
    const results = Object.values(traceabilities).map((traceability) => {
      const timestamp = new Date(traceability.executedAt).getTime() / 1000;
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
      const sender = {
        key: `${traceability.transactionHash}-${traceability.eventId}`,
        contractAddress: traceability.contractAddress,
        transactionHash: traceability.transactionHash,
        username: fromName,
        category: "send",
        timestamp: timestamp,
      } as CardProps;
      const receiver = {
        key: `${traceability.transactionHash}-${traceability.eventId}`,
        contractAddress: traceability.contractAddress,
        transactionHash: traceability.transactionHash,
        username: toName,
        category: BigInt(traceability.fromAddress) === 0n ? "mint" : "receive",
        timestamp: timestamp,
      } as CardProps;
      if (BigInt(traceability.fromAddress) === 0n) {
        return [receiver];
      }
      return [receiver, sender];
    });
    return results;
  }, [traceabilities, usernames]);

  return {
    traceabilities: [...transfers.flat(), ...sales, ...listings].sort(
      (a, b) => b.timestamp - a.timestamp,
    ),
    status,
  };
}
