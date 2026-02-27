import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ActivityAchievementCard,
  ActivityCollectibleCard,
  ActivityGameCard,
  ActivityTokenCard,
  Button,
  Empty,
  LayoutContent,
  PlusIcon,
  Skeleton,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useExplorer } from "@starknet-react/core";
import { useData } from "@/hooks/data";
import { CardProps } from "@/components/provider/data";

const OFFSET = 100;

export function Activity() {
  const [cap, setCap] = useState(OFFSET);
  const explorer = useExplorer();

  const { events: data, status } = useData();

  const to = useCallback(
    (transactionHash: string) => {
      return explorer.transaction(transactionHash);
    },
    [explorer],
  );

  const { events, dates } = useMemo(() => {
    const filteredData = data.slice(0, cap);
    return {
      events: filteredData,
      dates: [...new Set(filteredData.map((event) => event.date))],
    };
  }, [data, cap]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !data.length ? (
    <EmptyState />
  ) : (
    <LayoutContent>
      {dates.map((current) => {
        return (
          <div key={current} className="flex flex-col gap-y-2 select-none">
            <p className="text-foreground-400 text-xs font-bold uppercase mb-2 leading-none">
              {current}
            </p>
            <div className="flex flex-col gap-y-2">
              {events
                .filter((event) => event.date === current)
                .map((props: CardProps, index: number) => {
                  switch (props.variant) {
                    case "token":
                      return (
                        <Link
                          key={`${index}-${props.key}-${props.username}`}
                          to={to(props.transactionHash)}
                          target="_blank"
                        >
                          <ActivityTokenCard
                            amount={props.amount}
                            address={props.address}
                            username={props.username}
                            value={props.value}
                            image={props.image}
                            action={props.action}
                            timestamp={props.timestamp * 1000}
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
                            username={props.username}
                            image={props.image}
                            action={props.action}
                            timestamp={props.timestamp * 1000}
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
                            action={props.title}
                            name={props.name}
                            themeColor={props.color}
                            website={props.website}
                            certified={props.certified}
                            timestamp={props.timestamp * 1000}
                          />
                        </Link>
                      );
                    case "achievement":
                      return (
                        <ActivityAchievementCard
                          key={`${index}-${props.key}`}
                          title={"Achievement"}
                          topic={props.title}
                          image={props.image}
                          points={props.points || 0}
                          themeColor={props.color}
                          website={props.website}
                          certified={props.certified}
                          timestamp={props.timestamp * 1000}
                        />
                      );
                  }
                })}
            </div>
          </div>
        );
      })}
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

export const LoadingState = ({ rowCount = 5 }: { rowCount?: number }) => {
  return (
    <LayoutContent>
      <Skeleton className="w-1/5 h-4 py-4 rounded" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rowCount }).map((_, index) => (
          <Skeleton key={index} className="w-full h-16 rounded" />
        ))}
      </div>
    </LayoutContent>
  );
};

export const EmptyState = () => {
  return (
    <LayoutContent>
      <Empty
        title="No activity has been detected for this profile."
        icon="activity"
        className="h-full"
      />
    </LayoutContent>
  );
};
