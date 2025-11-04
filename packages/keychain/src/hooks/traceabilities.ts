import { useMemo } from "react";
import { formatAddress } from "@cartridge/ui/utils";
import { useUsernames } from "./account";
import { getChecksumAddress } from "starknet";
import { useMarketplace } from "@/hooks/marketplace";
import { erc20Metadata } from "@cartridge/presets";
import { useTransfers } from "@/hooks/transfers";
import makeBlockie from "ethereum-blockies-base64";

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
  const { data: transfersData, status } = useTransfers(
    contractAddress,
    tokenId,
  );

  const traceabilities = useMemo(() => {
    if (!transfersData || transfersData.length === 0) return {};
    const newTraceabilities: { [key: string]: Traceability } = {};

    transfersData.forEach((transfer) => {
      const key = `${transfer.transactionHash}-${transfer.eventId}`;
      const traceability: Traceability = {
        project: "", // Project is not available from SQL query
        amount: Number(transfer.amount),
        contractAddress: transfer.contractAddress,
        decimals: Number(transfer.decimals),
        eventId: transfer.eventId,
        executedAt: transfer.executedAt,
        fromAddress: transfer.fromAddress,
        toAddress: transfer.toAddress,
        metadata: transfer.metadata,
        name: transfer.name,
        symbol: transfer.symbol,
        tokenId: transfer.tokenId,
        transactionHash: transfer.transactionHash,
      };
      newTraceabilities[key] = traceability;
    });

    return newTraceabilities;
  }, [transfersData]);

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
        (user: { username?: string; address?: string }) =>
          BigInt(user.address ?? "0x0") === BigInt(sale.from),
      )?.username;
      const token = erc20Metadata.find(
        (metadata) =>
          BigInt(metadata.l2_token_address) === BigInt(sale.order.currency),
      );
      const currencyImage =
        token?.logo_url || makeBlockie(getChecksumAddress(sale.order.currency));
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
  }, [salesData, usernames, contractAddress, tokenId]);

  const listings: CardProps[] = useMemo(() => {
    if (!contractAddress || !tokenId) return [];
    const collectionListings =
      listingsData[getChecksumAddress(contractAddress)];
    if (!collectionListings) return [];
    const tokenListings = collectionListings[`${BigInt(tokenId).toString()}`];
    if (!tokenListings) return [];
    return Object.values(tokenListings).map((listing) => {
      const username = usernames.find(
        (user: { username?: string; address?: string }) =>
          BigInt(user.address ?? "0x0") === BigInt(listing.order.owner),
      )?.username;
      const token = erc20Metadata.find(
        (metadata) =>
          BigInt(metadata.l2_token_address) === BigInt(listing.order.currency),
      );
      const currencyImage =
        token?.logo_url ||
        makeBlockie(getChecksumAddress(listing.order.currency || ""));
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
  }, [usernames, contractAddress, tokenId, listingsData]);

  const transfers: CardProps[][] = useMemo(() => {
    const results = Object.values(traceabilities).map((traceability) => {
      const timestamp = new Date(traceability.executedAt).getTime() / 1000;
      const from = `0x${BigInt(traceability.fromAddress).toString(16)}`;
      const fromName =
        usernames.find(
          (user: { username?: string; address?: string }) =>
            user.address === from,
        )?.username ??
        formatAddress(getChecksumAddress(from), {
          size: "xs",
        });
      const to = `0x${BigInt(traceability.toAddress).toString(16)}`;
      const toName =
        usernames.find(
          (user: { username?: string; address?: string }) =>
            user.address === to,
        )?.username ??
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
