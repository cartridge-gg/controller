import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { Link, useLocation } from "react-router-dom";
import { ScrollArea, Button, ArrowIcon, SpinnerIcon } from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab, Scoreboard } from "./tab";
import { useAccount, useUsername } from "@/hooks/account";
import { CopyAddress } from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Achievements } from "./achievements";
import { Pinneds } from "./pinneds";
import { Leaderboard } from "./leaderboard";
import { useAchievements } from "@/hooks/achievements";

export function Trophies({
  trophies: { achievements, players, isLoading },
  setAccountAddress,
}: {
  trophies: ReturnType<typeof useAchievements>;
  setAccountAddress: (address: string) => void;
}) {
  const { username: selfname, address: self } = useAccount();
  const location = useLocation();
  const { address } = useParams<{ address: string }>();
  const { username } = useUsername({ address: address || self || "" });

  const [activeTab, setActiveTab] = useState<"trophies" | "leaderboard">(
    "trophies",
  );

  const { pinneds, completed, total } = useMemo(() => {
    const pinneds = achievements
      .filter((item) => item.completed)
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3);
    const completed = achievements.filter((item) => item.completed).length;
    const total = achievements.length;
    return { pinneds, completed, total };
  }, [achievements]);

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
    <LayoutContainer
      left={
        !isSelf ? (
          <Link to={location.pathname.split("/").slice(0, -1).join("/")}>
            <Button variant="icon" size="icon">
              <ArrowIcon variant="left" />
            </Button>
          </Link>
        ) : undefined
      }
    >
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
      />

      {achievements.length ? (
        <LayoutContent className="pb-4">
          {isSelf && (
            <div className="flex justify-between gap-4">
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
                <Achievements
                  achievements={achievements}
                  softview={!isSelf}
                  enabled={pinneds.length < 3}
                  onPin={() => {}}
                />
              </div>
            </ScrollArea>
          )}
          {isSelf && activeTab === "leaderboard" && (
            <ScrollArea className="overflow-auto">
              <Leaderboard players={players} address={self} />
            </ScrollArea>
          )}
        </LayoutContent>
      ) : isLoading ? (
        <LayoutContent className="pb-4">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md text-muted-foreground/10 mb-4">
            <SpinnerIcon
              className="animate-spin text-muted-foreground/30"
              size="lg"
            />
          </div>
        </LayoutContent>
      ) : (
        <LayoutContent className="pb-4">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md text-muted-foreground/10 mb-4">
            <p className="text-muted-foreground/30">No trophies available</p>
          </div>
        </LayoutContent>
      )}
    </LayoutContainer>
  );
}
