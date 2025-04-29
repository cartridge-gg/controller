import { useNavigate } from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  LayoutContentLoader,
  LeaderboardTable,
  LeaderboardRow,
} from "@cartridge/ui-next";
import { useAccount, useUsernames } from "#hooks/account";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useData } from "#hooks/context";
import { useArcade } from "#hooks/arcade";
import { getChecksumAddress } from "starknet";
import { LayoutBottomNav } from "#components/bottom-nav";

export function Leaderboard() {
  const { address: self } = useAccount();
  const {
    trophies: { achievements, players, status },
    setAccountAddress,
  } = useData();
  const { followeds } = useArcade();

  const navigate = useNavigate();

  const followings = useMemo(() => {
    return followeds[getChecksumAddress(self)] || [];
  }, [followeds, self]);

  const addresses = useMemo(() => {
    return players.map((player) => player.address);
  }, [players]);

  const { usernames } = useUsernames({ addresses });

  const { address } = useParams<{ address: string }>();

  const isSelf = useMemo(() => {
    return !address || address === self;
  }, [address, self]);

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

  return (
    <LayoutContainer>
      <LayoutHeader
        variant="hidden"
        onBack={isSelf ? undefined : () => navigate(".")}
      />

      {achievements.length ? (
        <LayoutContent className="py-6 gap-y-6 select-none h-full">
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
        </LayoutContent>
      ) : status === "loading" ? (
        <LayoutContentLoader />
      ) : (
        <LayoutContent className="pb-4 select-none h-full">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md border-background-400 mb-4">
            <p className="text-foreground-400">No trophies available</p>
          </div>
        </LayoutContent>
      )}

      {isSelf && <LayoutBottomNav />}
    </LayoutContainer>
  );
}
