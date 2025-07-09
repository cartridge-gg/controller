import {
  LayoutContent,
  LeaderboardTable,
  LeaderboardRow,
  Empty,
  Skeleton,
} from "@cartridge/ui";
import { useAccount, useUsernames } from "#profile/hooks/account";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useData } from "#profile/hooks/data";
import { useArcade } from "#profile/hooks/arcade";
import { getChecksumAddress } from "starknet";
import { RootLayout } from "#profile/components/layout/RootLayout";

export function Leaderboard() {
  const { address: self } = useAccount();
  const {
    trophies: { players, status },
    setAccountAddress,
  } = useData();
  const { followeds } = useArcade();

  const followings = useMemo(() => {
    return self != "" ? followeds[getChecksumAddress(self)] || [] : [];
  }, [followeds, self]);

  const addresses = useMemo(() => {
    return players.map((player) => player.address);
  }, [players]);

  const { usernames } = useUsernames({ addresses });

  const { address } = useParams<{ address: string }>();

  const data = useMemo(() => {
    return players.map((player) => {
      return {
        address: player.address,
        name:
          usernames.find(
            (username) =>
              BigInt(username.address || "0x0") === BigInt(player.address),
          )?.username || player.address.slice(0, 9),
        points: player.earnings,
        highlight: player.address === (address || self),
        following: followings.includes(player.address),
      };
    });
  }, [players, address, self, usernames, followings]);

  useEffect(() => {
    setAccountAddress(address || self || "");
  }, [address, self, setAccountAddress]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !data.length ? (
    <EmptyState />
  ) : (
    <RootLayout>
      <LeaderboardTable className="h-full">
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
    </RootLayout>
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
