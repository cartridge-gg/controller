import { LayoutContent, Empty, Skeleton } from "@cartridge/ui";
import { useAccount } from "@/hooks/account";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Trophies } from "./trophies";
import { useData } from "@/hooks/data";

export function Achievements() {
  const account = useAccount();
  const self = account?.address || "";
  const {
    trophies: { achievements, players, status },
    setAccountAddress,
  } = useData();

  const { address } = useParams<{ address: string }>();

  const points = useMemo(() => {
    return (
      players.find((player) => player.address === (address || self))
        ?.earnings || 0
    );
  }, [address, self, players]);

  useEffect(() => {
    setAccountAddress(address || self || "");
  }, [address, self, setAccountAddress]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !achievements.length ? (
    <EmptyState />
  ) : (
    <LayoutContent className="select-none">
      <Trophies
        achievements={achievements}
        pinneds={[]}
        softview={false}
        enabled={false}
        game={undefined}
        edition={undefined}
        pins={{}}
        earnings={points}
      />
    </LayoutContent>
  );
}

const LoadingState = () => {
  return (
    <LayoutContent className="gap-y-4 select-none h-full overflow-hidden">
      <div className="flex justify-between">
        <Skeleton className="min-h-[136px] w-[120px] rounded" />
        <Skeleton className="min-h-[136px] w-[120px] rounded" />
        <Skeleton className="min-h-[136px] w-[120px] rounded" />
      </div>
      <Skeleton className="min-h-10 w-full rounded" />
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="min-h-[177px] w-full rounded" />
      ))}
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No achievements exist for this game."
        icon="achievement"
        className="h-full"
      />
    </LayoutContent>
  );
};
