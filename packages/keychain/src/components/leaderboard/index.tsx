import {
  LayoutContent,
  LeaderboardTable,
  LeaderboardRow,
  Empty,
  Skeleton,
} from "@cartridge/ui";
import { useAccount, useUsernames } from "@/hooks/account";
import { useEffect, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useData } from "@/hooks/data";
import { useArcade } from "@/hooks/arcade";
import { getChecksumAddress } from "starknet";

export function Leaderboard() {
  const account = useAccount();
  const self = account?.address || "";
  const {
    trophies: { players, status },
    setAccountAddress,
  } = useData();
  const { followeds } = useArcade();

  const followings = useMemo(() => {
    return self != "" ? followeds[getChecksumAddress(self)] || [] : [];
  }, [followeds, self]);

  const addresses = useMemo(() => {
    return players.map((player) => `0x${BigInt(player.address).toString(16)}`);
  }, [players]);

  const { usernames } = useUsernames({ addresses });

  const { address } = useLocalSearchParams<{ address: string }>();
  const addressStr = address as string;

  const data = useMemo(() => {
    return players.map((player) => {
      return {
        address: player.address,
        name:
          usernames.find(
            (user: { username?: string; address?: string }) =>
              BigInt(user.address || "0x0") === BigInt(player.address),
          )?.username || player.address.slice(0, 9),
        points: player.earnings,
        highlight: player.address === (addressStr || self),
        following: followings.includes(player.address),
      };
    });
  }, [players, addressStr, self, usernames, followings]);

  useEffect(() => {
    setAccountAddress(addressStr || self || "");
  }, [addressStr, self, setAccountAddress]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !data.length ? (
    <EmptyState />
  ) : (
    <LayoutContent className="flex flex-col pt-6 pb-0 gap-6 overflow-y-auto">
      <LeaderboardTable className="flex">
        {data.map((item, index) => (
          <LeaderboardRow
            key={index}
            rank={index + 1}
            name={item.name}
            points={item.points}
            highlight={item.highlight}
            following={item.following}
          />
        ))}
      </LeaderboardTable>
    </LayoutContent>
  );
}

const LoadingState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Skeleton className="h-full w-full rounded" />
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No leaderboard available for this game."
        icon="leaderboard"
        className="h-full"
      />
    </LayoutContent>
  );
};
