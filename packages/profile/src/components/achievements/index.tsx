import { useNavigate } from "react-router-dom";
import {
  ScrollArea,
  Spinner,
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab, Scoreboard } from "./tab";
import { useAccount, useUsername } from "@/hooks/account";
import { CopyAddress } from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Trophies } from "./trophies";
import { Pinneds } from "./pinneds";
import { Leaderboard } from "./leaderboard";
import { useConnection, useData } from "@/hooks/context";
import { useArcade } from "@/hooks/arcade";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { addAddressPadding } from "starknet";

export function Achievements() {
  const { username: selfname, address: self } = useAccount();
  const {
    trophies: { achievements, players, isLoading },
    setAccountAddress,
  } = useData();
  const navigate = useNavigate();

  const { pins, games } = useArcade();

  const { address } = useParams<{ address: string }>();
  const { username } = useUsername({ address: address || self || "" });
  const { project, namespace, chainId, openSettings } = useConnection();

  const [activeTab, setActiveTab] = useState<"trophies" | "leaderboard">(
    "trophies",
  );

  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find(
      (game) => game.namespace === namespace && game.project === project,
    );
  }, [games, project, namespace]);

  const { pinneds, completed, total } = useMemo(() => {
    const ids = pins[addAddressPadding(address || self || "0x0")] || [];
    const pinneds = achievements
      .filter((item) => ids.includes(item.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    const completed = achievements.filter((item) => item.completed).length;
    const total = achievements.length;
    return { pinneds, completed, total };
  }, [achievements, pins, address, self]);

  const { rank, earnings } = useMemo(() => {
    const rank =
      players.findIndex((player) => player.address === (address || self)) + 1;
    const earnings =
      players.find((player) => player.address === (address || self))
        ?.earnings || 0;
    return { rank, earnings };
  }, [address, self, players]);

  const isSelf = useMemo(() => {
    return !address || address === self;
  }, [address, self]);

  useEffect(() => {
    setAccountAddress(address || self || "");
  }, [address, self, setAccountAddress]);

  return (
    <LayoutContainer>
      <LayoutHeader
        title={
          isSelf
            ? selfname
            : username
              ? username
              : (address || self).slice(0, 9)
        }
        description={<CopyAddress address={address || self} size="sm" />}
        right={
          isSelf ? (
            <Navigation />
          ) : (
            <Scoreboard rank={rank} earnings={earnings} />
          )
        }
        chainId={chainId}
        openSettings={openSettings}
        onBack={() => {
          navigate(".");
        }}
      />

      {achievements.length ? (
        <LayoutContent className="pb-4 select-none">
          {isSelf && (
            <div className="flex justify-between gap-x-3 gap-y-4">
              <TrophiesTab
                active={activeTab === "trophies"}
                completed={completed}
                total={total}
                onClick={() => setActiveTab("trophies")}
              />
              <LeaderboardTab
                active={activeTab === "leaderboard"}
                rank={rank}
                earnings={earnings}
                onClick={() => setActiveTab("leaderboard")}
              />
            </div>
          )}
          {(!isSelf || activeTab === "trophies") && (
            <ScrollArea className="overflow-auto">
              <div className="flex flex-col h-full flex-1 overflow-y-auto gap-4">
                <Pinneds achievements={pinneds} />
                <Trophies
                  achievements={achievements}
                  softview={!isSelf}
                  enabled={pinneds.length < 3}
                  game={game}
                  pins={pins}
                />
              </div>
            </ScrollArea>
          )}
          {isSelf && activeTab === "leaderboard" && (
            <Leaderboard
              players={players}
              address={self}
              achievements={achievements}
              pins={pins}
            />
          )}
        </LayoutContent>
      ) : isLoading ? (
        <LayoutContent className="pb-4 select-none">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md text-muted-foreground/10 mb-4">
            <Spinner className="text-muted-foreground/30" size="lg" />
          </div>
        </LayoutContent>
      ) : (
        <LayoutContent className="pb-4 select-none">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md text-muted-foreground/10 mb-4">
            <p className="text-muted-foreground/30">No trophies available</p>
          </div>
        </LayoutContent>
      )}
    </LayoutContainer>
  );
}
