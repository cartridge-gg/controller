import { useState, ReactNode, useMemo } from "react";
import { useAchievements } from "@/hooks/achievements";
import { DataContext } from "@/context/data";
import {
  useActivitiesQuery,
  useTransfersQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useAccount } from "@/hooks/account";
import { useConnection, useControllerTheme } from "@/hooks/connection";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { erc20Metadata } from "@cartridge/presets";
import { getDate } from "@cartridge/ui/utils";
import makeBlockie from "ethereum-blockies-base64";

export interface CardProps {
  variant: "token" | "collectible" | "game" | "achievement";
  key: string;
  contractAddress: string;
  transactionHash: string;
  amount: string;
  address: string;
  value: string;
  name: string;
  collection: string;
  image: string;
  title: string;
  website: string;
  certified: boolean;
  action: "send" | "receive" | "mint";
  timestamp: number;
  date: string;
  points?: number;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const theme = useControllerTheme();
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined,
  );

  const account = useAccount();
  const address = account?.address || "";
  const { project } = useConnection();

  const projects = useMemo(() => {
    const projects = project ? [project] : [];
    return projects.map((proejct) => {
      return {
        project: proejct,
        address,
        limit: 0,
      };
    });
  }, [project, address]);

  const trophies = useAchievements(accountAddress);

  const {
    data: transfers,
    status: transfersStatus,
    refetch: refetchTransfers,
  } = useTransfersQuery(
    {
      projects: projects.map((p) => ({ ...p, date: "" })),
    },
    {
      queryKey: ["transfers", address, project],
      enabled: !!address && projects.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: transactions,
    status: activitiesStatus,
    refetch: refetchTransactions,
  } = useActivitiesQuery(
    {
      projects,
    },
    {
      queryKey: ["activities", address, project],
      enabled: !!address && projects.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const status = useMemo(() => {
    return transfersStatus === "loading" && activitiesStatus === "loading"
      ? "loading"
      : transfersStatus === "error" || activitiesStatus === "error"
        ? "error"
        : "success";
  }, [transfersStatus, activitiesStatus]);

  const erc20s: CardProps[] = useMemo(() => {
    return (
      transfers?.transfers?.items.flatMap((item) =>
        item.transfers
          .filter(({ tokenId }) => !tokenId)
          .map((transfer) => {
            const value = `${(BigInt(transfer.amount) / BigInt(10 ** Number(transfer.decimals))).toString()} ${transfer.symbol}`;
            const timestamp = new Date(transfer.executedAt).getTime();
            const date = getDate(timestamp);
            const image =
              erc20Metadata.find(
                (m) =>
                  getChecksumAddress(m.l2_token_address) ===
                  getChecksumAddress(transfer.contractAddress),
              )?.logo_url ||
              makeBlockie(getChecksumAddress(transfer.contractAddress));
            return {
              variant: "token",
              key: `${transfer.transactionHash}-${transfer.eventId}`,
              contractAddress: transfer.contractAddress,
              transactionHash: transfer.transactionHash,
              amount: value,
              address:
                BigInt(transfer.fromAddress) === BigInt(address)
                  ? transfer.toAddress
                  : transfer.fromAddress,
              value: "$-",
              image: image || "",
              action:
                BigInt(transfer.fromAddress) === 0n
                  ? "mint"
                  : BigInt(transfer.fromAddress) === BigInt(address)
                    ? "send"
                    : "receive",
              timestamp: timestamp / 1000,
              date: date,
            } as CardProps;
          }),
      ) || []
    );
  }, [transfers, address]);

  const erc721s: CardProps[] = useMemo(() => {
    return (
      transfers?.transfers?.items.flatMap((item) => {
        return item.transfers
          .filter(({ tokenId }) => !!tokenId)
          .map((transfer) => {
            const timestamp = new Date(transfer.executedAt).getTime();
            const date = getDate(timestamp);
            let metadata;
            try {
              metadata = JSON.parse(
                !transfer.metadata ? "{}" : transfer.metadata,
              );
            } catch (error) {
              console.warn(error);
            }
            const name =
              metadata.attributes?.find(
                (attribute: { trait: string; value: string }) =>
                  attribute?.trait?.toLowerCase() === "name",
              )?.value || metadata.name;
            const image = `https://api.cartridge.gg/x/${item.meta.project}/torii/static/${addAddressPadding(transfer.contractAddress)}/${transfer.tokenId}/image`;
            return {
              variant: "collectible",
              key: `${transfer.transactionHash}-${transfer.eventId}`,
              contractAddress: transfer.contractAddress,
              transactionHash: transfer.transactionHash,
              name: name || "",
              collection: transfer.name,
              amount: "",
              address:
                BigInt(transfer.fromAddress) === BigInt(address)
                  ? transfer.toAddress
                  : transfer.fromAddress,
              value: "",
              image: image,
              action:
                BigInt(transfer.fromAddress) === 0n
                  ? "mint"
                  : BigInt(transfer.fromAddress) === BigInt(address)
                    ? "send"
                    : "receive",
              timestamp: timestamp / 1000,
              date: date,
            } as CardProps;
          });
      }) || []
    );
  }, [transfers, address]);

  const actions: CardProps[] = useMemo(() => {
    return (
      transactions?.activities?.items?.flatMap((item) =>
        item.activities?.map(
          ({ transactionHash, contractAddress, entrypoint, executedAt }) => {
            const timestamp = new Date(executedAt).getTime();
            const date = getDate(timestamp);
            return {
              variant: "game",
              key: `${transactionHash}-${entrypoint}`,
              contractAddress: contractAddress,
              transactionHash: transactionHash,
              title: entrypoint.replace(/_/g, " "),
              image: theme?.icon || "",
              website: "",
              certified: false,
              timestamp: timestamp / 1000,
              date: date,
            } as CardProps;
          },
        ),
      ) || []
    );
  }, [transactions, theme]);

  const achievements: CardProps[] = useMemo(() => {
    return trophies.achievements
      .filter((item) => item.completed)
      .map((item) => {
        const date = getDate(item.timestamp * 1000);
        return {
          variant: "achievement",
          key: item.id,
          transactionHash: "",
          contractAddress: "",
          title: item.title,
          image: item.icon,
          timestamp: item.timestamp,
          date: date,
          website: "",
          certified: false,
          points: item.earning,
          amount: "",
          address: "",
          value: "",
          name: "",
          collection: "",
          action: "mint",
        } as CardProps;
      });
  }, [trophies]);

  const events = useMemo(() => {
    return [...erc20s, ...erc721s, ...actions, ...achievements].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [erc20s, erc721s, actions, achievements]);

  return (
    <DataContext.Provider
      value={{
        events,
        trophies,
        transfers,
        transactions,
        status,
        setAccountAddress,
        refetchTransfers,
        refetchTransactions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
