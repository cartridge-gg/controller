import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  LayoutContentLoader,
  AchievementTabs,
  TabsContent,
  AchievementLeaderboard,
  AchievementLeaderboardRow,
  AchievementPlayerLabel,
} from "@cartridge/ui-next";
import { useAccount, useUsername, useUsernames } from "#hooks/account";
import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Trophies } from "./trophies";
import { useConnection, useData } from "@/hooks/context";
import { useArcade } from "@/hooks/arcade";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { addAddressPadding } from "starknet";
import { LayoutBottomNav } from "@/components/bottom-nav";

export function Achievements() {
  const { address: self } = useAccount();
  const {
    trophies: { achievements, players, isLoading },
    setAccountAddress,
  } = useData();
  const navigate = useNavigate();

  const addresses = useMemo(() => {
    return players.map((player) => player.address);
  }, [players]);

  const { usernames } = useUsernames({ addresses });

  const { pins, games } = useArcade();

  const { address } = useParams<{ address: string }>();
  const { username } = useUsername({ address: address || self || "" });
  const { project, namespace } = useConnection();

  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find(
      (game) => game.namespace === namespace && game.project === project,
    );
  }, [games, project, namespace]);

  const { pinneds, count, total } = useMemo(() => {
    const ids = pins[addAddressPadding(address || self || "0x0")] || [];
    const pinneds = achievements
      .filter((item) => ids.includes(item.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    const count = achievements.filter((item) => item.completed).length;
    const total = achievements.length;
    return { pinneds, count, total };
  }, [achievements, pins, address, self]);

  const { rank, points } = useMemo(() => {
    const rank =
      players.findIndex((player) => player.address === (address || self)) + 1;
    const points =
      players.find((player) => player.address === (address || self))
        ?.earnings || 0;
    return { rank, points };
  }, [address, self, players]);

  const isSelf = useMemo(() => {
    return !address || address === self;
  }, [address, self]);

  const location = useLocation();
  const to = useCallback(
    (address: string) => {
      if (address === self) return navigate(location.pathname);
      navigate([...location.pathname.split("/"), address].join("/"));
    },
    [location.pathname, self, navigate],
  );

  const data = useMemo(() => {
    return players.map((player) => ({
      address: player.address,
      name:
        usernames.find(
          (username) =>
            BigInt(username.address || "0x0") === BigInt(player.address),
        )?.username || player.address.slice(0, 9),
      points: player.earnings,
      highlight: player.address === (address || self),
      pins: pins[addAddressPadding(player.address)]
        ?.map((id) => {
          const achievement = achievements.find((a) => a?.id === id);
          return achievement ? { id, icon: achievement.icon } : undefined;
        })
        .filter(Boolean) as { id: string; icon: string }[],
    }));
  }, [players, address, self, pins, usernames]);

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
          {isSelf ? (
            <AchievementTabs
              count={count}
              total={total}
              rank={rank}
              className="h-full flex flex-col justify-between gap-y-6"
            >
              <TabsContent className="p-0 mt-0 pb-6" value="achievements">
                <Trophies
                  achievements={achievements}
                  pinneds={pinneds}
                  softview={!isSelf}
                  enabled={pinneds.length < 3}
                  game={game}
                  pins={pins}
                  earnings={points}
                />
              </TabsContent>
              <TabsContent
                className="p-0 mt-0 h-[calc(100%-69px)]"
                value="leaderboard"
              >
                <AchievementLeaderboard className="h-full">
                  {data.map((item, index) => (
                    <AchievementLeaderboardRow
                      key={index}
                      pins={item.pins || []}
                      rank={index + 1}
                      name={item.name}
                      points={item.points}
                      highlight={item.highlight}
                      onClick={() => to(item.address)}
                    />
                  ))}
                </AchievementLeaderboard>
              </TabsContent>
            </AchievementTabs>
          ) : (
            <>
              <AchievementPlayerLabel
                username={username}
                address={address || self}
              />
              <Trophies
                achievements={achievements}
                pinneds={pinneds}
                softview={!isSelf}
                enabled={pinneds.length < 3}
                game={game}
                pins={pins}
                earnings={points}
              />
            </>
          )}
        </LayoutContent>
      ) : isLoading ? (
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
