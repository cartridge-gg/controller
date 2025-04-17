import {
  ActivityAchievementCard,
  ActivityCollectibleCard,
  ActivityGameCard,
  ActivityTokenCard,
  Button,
  cn,
  EmptyStateActivityIcon,
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutHeader,
  PlusIcon,
} from "@cartridge/ui-next";
import { VoyagerUrl } from "@cartridge/utils";
import { useConnection, useData } from "#hooks/context";
import { LayoutBottomNav } from "#components/bottom-nav";
import { useCallback, useMemo, useState } from "react";
import { constants } from "starknet";
import { Link } from "react-router-dom";

const OFFSET = 100;

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
  const [cap, setCap] = useState(OFFSET);
  const { chainId } = useConnection();

  const { events: data, status } = useData();

  const to = useCallback(
    (transactionHash: string) => {
      return VoyagerUrl(chainId as constants.StarknetChainId).transaction(
        transactionHash,
      );
    },
    [chainId],
  );

  const { events, dates } = useMemo(() => {
    const filteredData = data.slice(0, cap);
    return {
      events: filteredData,
      dates: [...new Set(filteredData.map((event) => event.date))],
    };
  }, [data, cap]);

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
                        {events
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
                                    key={`${index}-${props.key}`}
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
                <Button
                  variant="secondary"
                  className={cn(
                    "text-foreground-300 hover:text-foreground-200 normal-case text-sm font-medium tracking-normal font-sans",
                    (cap >= data.length || dates.length === 0) && "hidden",
                  )}
                  onClick={() => setCap((prev) => prev + OFFSET)}
                >
                  <PlusIcon variant="solid" size="xs" />
                  See More
                </Button>
              </LayoutContent>
            );
          }
        }
      })()}

      <LayoutBottomNav />
    </LayoutContainer>
  );
}
