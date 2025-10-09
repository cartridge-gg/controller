import {
  LayoutContent,
  LeaderboardTable,
  LeaderboardRow,
  Empty,
  Skeleton,
} from "@cartridge/ui";
import { useAccount, useUsernames } from "@/hooks/account";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/hooks/data";
import { getChecksumAddress } from "starknet";
import { useUsername } from "@/hooks/username";

export function Leaderboard() {
  const account = useAccount();
  const self = account?.address || "";
  const {
    trophies: { players, status },
    setAccountAddress,
  } = useData();

  const addresses = useMemo(() => {
    return players.map((player) => `0x${BigInt(player.address).toString(16)}`);
  }, [players]);

  const { usernames } = useUsernames({ addresses });

  const { address } = useParams<{ address: string }>();

  const { username } = useUsername({ address: address || self });

  const data = useMemo(() => {
    const playersList = players.map((player) => {
      return {
        address: player.address,
        name:
          usernames.find(
            (user: { username?: string; address?: string }) =>
              BigInt(user.address || "0x0") === BigInt(player.address),
          )?.username || player.address.slice(0, 9),
        points: player.earnings,
        highlight:
          getChecksumAddress(player.address) ===
          getChecksumAddress(address || self),
        following: false,
      };
    });

    // Check if current user is in the leaderboard
    const currentUserAddress = address || self;
    const isCurrentUserInList = playersList.some(
      (player) =>
        getChecksumAddress(player.address) ===
        getChecksumAddress(currentUserAddress),
    );

    // If current user is not in the leaderboard, add them to the end with 0 points
    if (!isCurrentUserInList && currentUserAddress) {
      const currentUserName = username || currentUserAddress.slice(0, 9);

      playersList.push({
        address: currentUserAddress,
        name: currentUserName,
        points: 0,
        highlight: true,
        following: false,
      });
    }

    return playersList;
  }, [players, address, self, usernames, username]);

  useEffect(() => {
    setAccountAddress(address || self || "");
  }, [address, self, setAccountAddress]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !data.length ? (
    <EmptyState />
  ) : (
    <LayoutContent>
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
