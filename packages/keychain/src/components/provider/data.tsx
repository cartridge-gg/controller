import { useState, ReactNode, useMemo } from "react";
import { useAchievements } from "@/hooks/achievements";
import { DataContext } from "@/context/data";
import {
  useActivitiesQuery,
  useTransfersQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useAccount, useUsernames } from "@/hooks/account";
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
  username: string;
  value: string;
  name: string;
  collection: string;
  image: string;
  title: string;
  color: string;
  website: string;
  certified: boolean;
  action: "send" | "receive" | "mint";
  timestamp: number;
  date: string;
  points?: number;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const controllerTheme = useControllerTheme();
  const theme = useMemo(
    () => ({
      color:
        typeof controllerTheme?.colors?.primary == "string"
          ? (controllerTheme?.colors?.primary as string)
          : "#ffffff",
      icon: controllerTheme?.icon ?? "",
      certified: controllerTheme?.verified ?? false,
    }),
    [controllerTheme],
  );

  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined,
  );

  const account = useAccount();
  const address = useMemo(
    () => (account ? addAddressPadding(account.address) : ""),
    [account],
  );
  const { project } = useConnection();

  const projects = useMemo(() => {
    const projects = project ? [project] : [];
    return projects.map((project) => {
      return {
        project,
        address,
        limit: 0,
        date: "",
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
      projects,
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
      projects: projects.map((p) => ({ ...p, date: undefined })),
    },
    {
      queryKey: ["activities", address, project],
      enabled: !!address && projects.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const status = useMemo(() => {
    return transfersStatus === "loading" || activitiesStatus === "loading"
      ? "loading"
      : transfersStatus === "error" && activitiesStatus === "error"
        ? "error"
        : "success";
  }, [transfersStatus, activitiesStatus]);
  const addresses = useMemo<string[]>(() => {
    const accounts =
      transfers?.transfers?.items.flatMap((item) =>
        item.transfers.reduce(
          (acc, item) => [
            ...acc,
            `0x${BigInt(item.fromAddress).toString(16)}`,
            `0x${BigInt(item.toAddress).toString(16)}`,
          ],
          [] as string[],
        ),
      ) ?? [];
    return Array.from(new Set(accounts));
  }, [transfers]);
  const { usernames } = useUsernames({ addresses });

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
            const userAddress =
              BigInt(transfer.fromAddress) === BigInt(address)
                ? transfer.toAddress
                : transfer.fromAddress;
            const username = usernames.find(
              (user) => BigInt(user.address ?? "0x0") === BigInt(userAddress),
            )?.username;
            const result: CardProps = {
              variant: "token",
              key: `${transfer.transactionHash}-${transfer.eventId}`,
              contractAddress: transfer.contractAddress,
              transactionHash: transfer.transactionHash,
              amount: value,
              address: userAddress,
              username: username ?? "",
              value: "$-",
              name: "",
              collection: "",
              image: image || "",
              title: "",
              color: theme.color,
              website: "",
              certified: theme.certified,
              action:
                BigInt(transfer.fromAddress) === 0n
                  ? "mint"
                  : BigInt(transfer.fromAddress) === BigInt(address)
                    ? "send"
                    : "receive",
              timestamp: timestamp / 1000,
              date: date,
            };
            return result;
          }),
      ) || []
    );
  }, [transfers, address, usernames, theme]);

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
            const userAddress =
              BigInt(transfer.fromAddress) === BigInt(address)
                ? transfer.toAddress
                : transfer.fromAddress;
            const username = usernames.find(
              (user) => BigInt(user.address ?? "0x0") === BigInt(userAddress),
            )?.username;
            const result: CardProps = {
              variant: "collectible",
              key: `${transfer.transactionHash}-${transfer.eventId}`,
              contractAddress: transfer.contractAddress,
              transactionHash: transfer.transactionHash,
              amount: "",
              address: userAddress,
              username: username ?? "",
              value: "",
              name: name || "",
              collection: transfer.name,
              image: image,
              title: "",
              color: theme.color,
              website: "",
              certified: theme.certified,
              action:
                BigInt(transfer.fromAddress) === 0n
                  ? "mint"
                  : BigInt(transfer.fromAddress) === BigInt(address)
                    ? "send"
                    : "receive",
              timestamp: timestamp / 1000,
              date: date,
            };
            return result;
          });
      }) || []
    );
  }, [transfers, address, usernames, theme]);

  const actions: CardProps[] = useMemo(() => {
    return (
      transactions?.activities?.items?.flatMap((item) =>
        item.activities?.map(
          ({ transactionHash, contractAddress, entrypoint, executedAt }) => {
            const timestamp = new Date(executedAt).getTime();
            const date = getDate(timestamp);
            const result: CardProps = {
              variant: "game",
              key: `${transactionHash}-${entrypoint}`,
              contractAddress: contractAddress,
              transactionHash: transactionHash,
              amount: "",
              address: "",
              username: "",
              value: "",
              name: "",
              collection: "",
              image: theme.icon,
              title: entrypoint.replace(/_/g, " "),
              color: theme.color,
              website: "",
              certified: theme.certified,
              action: "mint",
              timestamp: timestamp / 1000,
              date: date,
            };
            return result;
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
        const result: CardProps = {
          variant: "achievement",
          key: item.id,
          contractAddress: "",
          transactionHash: "",
          amount: "",
          address: "",
          username: "",
          value: "",
          name: "",
          collection: "",
          image: item.icon,
          title: item.title,
          color: theme.color,
          website: "",
          certified: theme.certified,
          action: "mint",
          timestamp: item.timestamp,
          date: date,
          points: item.earning,
        };
        return result;
      });
  }, [trophies, theme]);

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
