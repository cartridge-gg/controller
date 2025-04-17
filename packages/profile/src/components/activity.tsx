import {
  ActivityAchievementCard,
  ActivityCollectibleCard,
  ActivityGameCard,
  ActivityTokenCard,
  EmptyStateActivityIcon,
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutHeader,
} from "@cartridge/ui-next";
import { erc20Metadata } from "@cartridge/presets";
import { useAccount } from "#hooks/account";
import { VoyagerUrl } from "@cartridge/utils";
import { useConnection, useData } from "#hooks/context";
import { LayoutBottomNav } from "#components/bottom-nav";
import { useCallback, useMemo } from "react";
import {
  useActivitiesQuery,
  useTransfersQuery,
} from "@cartridge/utils/api/cartridge";
import { useArcade } from "#hooks/arcade.js";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { constants, getChecksumAddress } from "starknet";
import { Link } from "react-router-dom";

interface CardProps {
  variant: "token" | "collectible" | "game" | "achievement";
  key: string;
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

export function Activity() {
  const { address } = useAccount();
  const { chainId, project, namespace } = useConnection();

  const { games } = useArcade();
  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find(
      (game) => game.namespace === namespace && game.config.project === project,
    );
  }, [games, project, namespace]);

  const { trophies } = useData();

  const { data: transfers, status: transfersStatus } = useTransfersQuery(
    {
      projects: {
        project: game?.config.project ?? "",
        address,
        date: "",
        limit: 0,
      },
    },
    {
      enabled: !!address && !!game?.config.project,
    },
  );

  const { data: transactions, status: activitiesStatus } = useActivitiesQuery(
    {
      projects: {
        project: game?.config.project ?? "",
        address,
        limit: 0,
      },
    },
    {
      enabled: !!address && !!game?.config.project,
    },
  );

  const getDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.getDate() === today.getDate()) {
      return "Today";
    } else if (date.getDate() === today.getDate() - 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }, []);

  const to = useCallback(
    (transactionHash: string) => {
      return VoyagerUrl(chainId as constants.StarknetChainId).transaction(
        transactionHash,
      );
    },
    [chainId],
  );

  const { data, dates } = useMemo(() => {
    const dates: string[] = [];
    const erc20s: CardProps[] =
      transfers?.transfers?.items
        .flatMap((item) =>
          item.transfers
            .filter(({ tokenId }) => !tokenId) // Filter ERC20 transfers
            .map(
              ({
                amount,
                decimals,
                symbol,
                executedAt,
                transactionHash,
                eventId,
                fromAddress,
                toAddress,
                contractAddress,
              }) => {
                const value = `${(BigInt(amount) / BigInt(10 ** Number(decimals))).toString()} ${symbol}`;
                const timestamp = new Date(executedAt).getTime();
                const date = getDate(timestamp);
                const image = erc20Metadata.find(
                  (m) =>
                    getChecksumAddress(m.l2_token_address) ===
                    getChecksumAddress(contractAddress),
                )?.logo_url;
                if (!dates.includes(date)) {
                  dates.push(date);
                }
                return {
                  variant: "token",
                  key: `${transactionHash}-${eventId}`,
                  transactionHash: transactionHash,
                  amount: value,
                  address:
                    BigInt(fromAddress) === BigInt(address)
                      ? toAddress
                      : fromAddress,
                  value: "$-",
                  image: image || "",
                  action:
                    BigInt(fromAddress) === 0n
                      ? "mint"
                      : BigInt(fromAddress) === BigInt(address)
                        ? "send"
                        : "receive",
                  timestamp: timestamp / 1000,
                  date: date,
                } as CardProps;
              },
            ),
        )
        .filter((i) => i !== undefined) || [];
    const erc721s: CardProps[] =
      transfers?.transfers?.items
        .flatMap((item) =>
          item.transfers
            .filter(({ tokenId }) => !!tokenId) // Filter ERC721 transfers
            .map((transfer) => {
              console.log({ transfer });
              const timestamp = new Date(transfer.executedAt).getTime();
              const date = getDate(timestamp);
              const metadata = JSON.parse(transfer.metadata ?? "{}");
              const name =
                metadata.attributes.find(
                  (attribute: any) => attribute.trait.toLowerCase() === "name",
                )?.value || metadata.name;
              if (!dates.includes(date)) {
                dates.push(date);
              }
              return {
                variant: "collectible",
                key: `${transfer.transactionHash}-${transfer.eventId}`,
                transactionHash: transfer.transactionHash,
                name: name || "",
                collection: transfer.name,
                amount: "",
                address:
                  BigInt(transfer.fromAddress) === BigInt(address)
                    ? transfer.toAddress
                    : transfer.fromAddress,
                value: "",
                image: metadata.image || "",
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
        )
        .filter((i) => i !== undefined) || [];
    const games: CardProps[] =
      transactions?.activities?.items
        ?.flatMap((item) =>
          item.activities?.map(
            ({ transactionHash, entrypoint, executedAt }) => {
              const timestamp = new Date(executedAt).getTime();
              const date = getDate(timestamp);
              if (!dates.includes(date)) {
                dates.push(date);
              }
              return {
                variant: "game",
                key: `${transactionHash}-${entrypoint}`,
                transactionHash: transactionHash,
                title: entrypoint,
                image: game?.metadata.image || "",
                website: game?.socials.website || "",
                certified: !!game,
                timestamp: timestamp / 1000,
                date: date,
              } as CardProps;
            },
          ),
        )
        .filter((i) => i !== undefined) || [];

    const achievements: CardProps[] = trophies.achievements
      .filter((item) => item.completed)
      .map((item) => {
        const date = getDate(item.timestamp * 1000);
        if (!dates.includes(date)) {
          dates.push(date);
        }
        return {
          variant: "achievement",
          key: item.id,
          transactionHash: "",
          title: item.title,
          image: item.icon,
          timestamp: item.timestamp,
          date: date,
          website: game?.socials.website || "",
          certified: !!game,
          points: item.earning,
          amount: "",
          address: "",
          value: "",
          name: "",
          collection: "",
          action: "mint",
        } as CardProps;
      });

    const sortedDates = dates.sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
    const uniqueDates = [...new Set(sortedDates)];
    return {
      data: [...erc20s, ...erc721s, ...games, ...achievements].sort(
        (a, b) => b.timestamp - a.timestamp,
      ),
      dates: uniqueDates,
    };
  }, [address, transfers, transactions, game, trophies, getDate]);

  return (
    <LayoutContainer>
      <LayoutHeader variant="hidden" />

      {(() => {
        switch (
          transfersStatus === "loading" && activitiesStatus === "loading"
            ? "loading"
            : transfersStatus === "error" || activitiesStatus === "error"
              ? "error"
              : "success"
        ) {
          case "loading": {
            return <LayoutContentLoader />;
          }
          case "error": {
            return <LayoutContentError />;
          }
          case "success": {
            return (
              <LayoutContent className="flex flex-col gap-4 p-6">
                {dates.length > 0 ? (
                  dates.map((current) => {
                    return (
                      <div className="flex flex-col gap-2" key={current}>
                        <p className="py-3 text-xs font-semibold text-foreground-400 tracking-wider">
                          {current}
                        </p>
                        {data
                          .filter(({ date }) => date === current)
                          .map((props: CardProps, index: number) => {
                            switch (props.variant) {
                              case "token":
                                return (
                                  <Link
                                    key={`${index}-${props.key}`}
                                    to={to(props.transactionHash)}
                                    target="_blank"
                                  >
                                    <ActivityTokenCard
                                      amount={props.amount}
                                      address={props.address}
                                      value={props.value}
                                      image={props.image}
                                      action={props.action}
                                    />
                                  </Link>
                                );
                              case "collectible":
                                return (
                                  <Link
                                    key={`${index}-${props.key}`}
                                    to={to(props.transactionHash)}
                                    target="_blank"
                                  >
                                    <ActivityCollectibleCard
                                      name={props.name}
                                      collection={props.collection}
                                      address={props.address}
                                      image={props.image}
                                      action={props.action}
                                    />
                                  </Link>
                                );
                              case "game":
                                return (
                                  <Link
                                    key={`${index}-${props.key}`}
                                    to={to(props.transactionHash)}
                                    target="_blank"
                                  >
                                    <ActivityGameCard
                                      title={props.title}
                                      website={props.website}
                                      image={props.image}
                                      certified={props.certified}
                                    />
                                  </Link>
                                );
                              case "achievement":
                                return (
                                  <ActivityAchievementCard
                                    title={"Achievement"}
                                    topic={props.title}
                                    website={props.website}
                                    image={props.image}
                                    certified={props.certified}
                                    points={props.points || 0}
                                  />
                                );
                            }
                          })}
                      </div>
                    );
                  })
                ) : (
                  <div className="select-none flex flex-col justify-center items-center gap-3 grow">
                    <EmptyStateActivityIcon className="h-[120px] w-[120px]" />
                    <p className="text-sm text-background-500">
                      No activity yet
                    </p>
                  </div>
                )}
              </LayoutContent>
            );
          }
        }
      })()}

      <LayoutBottomNav />
    </LayoutContainer>
  );
}
