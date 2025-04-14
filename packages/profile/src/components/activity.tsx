import {
  ActivityCollectibleCard,
  ActivityGameCard,
  ActivityTokenCard,
  Button,
  EmptyStateActivityIcon,
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutHeader,
} from "@cartridge/ui-next";
import {
  Erc20__Token,
  Erc721__Token,
  useInfiniteTokenTransfersQuery,
} from "@cartridge/utils/api/indexer";
import { useAccount } from "#hooks/account";
import { formatAddress, VoyagerUrl, useIndexerAPI } from "@cartridge/utils";
import { useConnection } from "#hooks/context";
import { LayoutBottomNav } from "#components/bottom-nav";
import { useCallback, useMemo } from "react";
import { useActivitiesQuery } from "@cartridge/utils/api/cartridge";
import { useArcade } from "#hooks/arcade.js";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { constants } from "starknet";
import { Link } from "react-router-dom";

interface CardProps {
  variant: "token" | "collectible" | "game";
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
}

export function Activity() {
  const { address } = useAccount();
  const { chainId, project, namespace, methods } = useConnection();

  const { games } = useArcade();
  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find(
      (game) => game.namespace === namespace && game.config.project === project,
    );
  }, [games, project, namespace]);

  const { isReady, indexerUrl } = useIndexerAPI();
  const {
    status,
    data: transfers,
    fetchNextPage,
    // hasNextPage,
  } = useInfiniteTokenTransfersQuery(
    {
      address,
      first: 1000,
    },
    {
      enabled: isReady && !!address,
      getNextPageParam: (lastPage) => {
        return lastPage.tokenTransfers?.pageInfo.endCursor;
      },
    },
  );

  // FIXME: The one returned from the query is not correct (always true)
  const hasNextPage = useMemo(() => {
    return transfers?.pages[transfers.pages.length - 1].tokenTransfers?.pageInfo
      .hasNextPage;
  }, [transfers]);

  const { data: transactions } = useActivitiesQuery(
    {
      projects: {
        project: "dopewarsbal",
        address,
        limit: 0,
      },
    },
    {
      enabled: isReady && !!address,
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
    if (!indexerUrl) return { data: [], dates };
    const erc20s: CardProps[] =
      transfers?.pages
        .flatMap((p) =>
          p.tokenTransfers?.edges
            .filter(
              ({ node: t }) => t.tokenMetadata.__typename === "ERC20__Token",
            )
            .map(({ node: token }) => {
              const metadata = token.tokenMetadata as Erc20__Token;
              const amount = `${(BigInt(metadata.amount) / BigInt(10 ** Number(metadata.decimals))).toString()} ${metadata.symbol}`;
              const timestamp = new Date(token.executedAt).getTime();
              const date = getDate(timestamp);
              if (!dates.includes(date)) {
                dates.push(date);
              }
              return {
                variant: "token",
                key: `${token.transactionHash}-${metadata.amount}`,
                transactionHash: token.transactionHash,
                amount: amount,
                address:
                  BigInt(token.from) === BigInt(address)
                    ? token.to
                    : token.from,
                value: "$-",
                image: "",
                action:
                  BigInt(token.from) === 0n
                    ? "mint"
                    : BigInt(token.from) === BigInt(address)
                      ? "send"
                      : "receive",
                timestamp: timestamp / 1000,
                date: date,
              } as CardProps;
            }),
        )
        .filter((i) => i !== undefined) || [];
    const erc721s: CardProps[] =
      transfers?.pages
        .flatMap((p) =>
          p.tokenTransfers?.edges
            .filter(
              ({ node: t }) => t.tokenMetadata.__typename === "ERC721__Token",
            )
            .map(({ node: token }) => {
              const metadata = token.tokenMetadata as Erc721__Token;
              const timestamp = new Date(token.executedAt).getTime();
              const date = getDate(timestamp);
              if (!dates.includes(date)) {
                dates.push(date);
              }
              return {
                variant: "collectible",
                key: `${token.transactionHash}-${metadata.tokenId}`,
                transactionHash: token.transactionHash,
                name: metadata.metadataName || "",
                collection: metadata.name,
                amount: "",
                address:
                  BigInt(token.from) === BigInt(address)
                    ? token.to
                    : token.from,
                value: "",
                image: metadata.imagePath
                  ? `${indexerUrl.replace("/graphql", "")}/static/${metadata.imagePath}`
                  : "",
                action:
                  BigInt(token.from) === 0n
                    ? "mint"
                    : BigInt(token.from) === BigInt(address)
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
        ?.flatMap((i) =>
          i.activities?.map(({ transactionHash, entrypoint, executedAt }) => {
            const timestamp = new Date(executedAt).getTime();
            const date = getDate(timestamp);
            if (!dates.includes(date)) {
              dates.push(date);
            }
            return {
              variant: "game",
              key: `${entrypoint}-${transactionHash}`,
              transactionHash: transactionHash,
              title:
                methods.find((m) => m.entrypoint === entrypoint)?.name ||
                formatAddress(entrypoint, { size: "xs" }),
              image: game?.metadata.image || "",
              website: game?.socials.website || "",
              certified: !!game,
              timestamp: timestamp / 1000,
              date: date,
            } as CardProps;
          }),
        )
        .filter((i) => i !== undefined) || [];
    const bound = Math.min(
      ...[...erc20s, ...erc721s].map(({ timestamp }) => timestamp),
    );
    const filteredDates = dates.filter(
      (date) => !hasNextPage || new Date(date).getTime() >= bound * 1000,
    );
    const sortedDates = filteredDates.sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
    const uniqueDates = [...new Set(sortedDates)];
    return {
      data: [...erc20s, ...erc721s, ...games].sort(
        (a, b) => b.timestamp - a.timestamp,
      ),
      dates: uniqueDates,
    };
  }, [
    address,
    transfers,
    transactions,
    methods,
    game,
    indexerUrl,
    hasNextPage,
    getDate,
  ]);

  return (
    <LayoutContainer>
      <LayoutHeader variant="hidden" />

      {(() => {
        switch (status) {
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

                {dates.length > 0 && hasNextPage && (
                  <Button
                    className="w-full my-2"
                    onClick={() => hasNextPage && fetchNextPage()}
                  >
                    See More
                  </Button>
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
