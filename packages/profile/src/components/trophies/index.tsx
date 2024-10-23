import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { ScrollArea, StateIconProps } from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab } from "./tab";
import { useAccount } from "@/hooks/context";
import { CopyAddress } from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Achievements } from "./achievements";
import { Pinneds } from "./pinneds";
import { Leaderboard } from "./leaderboard";
import { items, players } from "./data";

export interface Item {
  id: string;
  title: string;
  hidden_title: string;
  description: string;
  hidden_description: string;
  percentage: number;
  earning: number;
  timestamp: number;
  completed: boolean;
  hidden: boolean;
  pinned: boolean;
  Icon: React.ComponentType<StateIconProps> | undefined;
}

export interface Player {
  username: string;
  address: string;
  earnings: number;
  rank: number;
  Icon: React.ComponentType<StateIconProps> | undefined;
}

export function Trophies() {
  const { username, address } = useAccount();
  const [achievements, setAchievements] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<"trophies" | "leaderboard">(
    "trophies",
  );

  const { pinneds, completed, total } = useMemo(() => {
    const pinneds = achievements.filter((item) => item.pinned).slice(0, 3);
    const completed = achievements.filter((item) => item.completed).length;
    const total = achievements.length;
    return { pinneds, completed, total };
  }, [achievements]);

  const { rank, earnings } = useMemo(() => {
    const rank =
      players
        .sort((a, b) => a.rank - b.rank)
        .findIndex((player) => player.address === address) + 1;
    const earnings =
      players.find((player) => player.address === address)?.earnings || 0;
    return { rank, earnings };
  }, [address]);

  useEffect(() => {
    // Sort by id, timestamp, and completion
    const achievements = items
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .sort((a, b) => b.timestamp - a.timestamp)
      .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
    setAchievements(achievements);
  }, []);

  const onPin = useCallback(
    (id: string) => {
      const updated = achievements.map((item) => ({
        ...item,
        pinned: item.id === id ? !item.pinned : item.pinned,
      }));
      setAchievements(updated);
    },
    [achievements],
  );

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
      />

      {items.length ? (
        <LayoutContent className="pb-4">
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
          <ScrollArea className="overflow-auto">
            {activeTab === "trophies" && (
              <div className="flex flex-col h-full flex-1 overflow-y-auto gap-4">
                <Pinneds achievements={pinneds} />
                <Achievements
                  achievements={achievements}
                  enabled={pinneds.length < 3}
                  onPin={onPin}
                />
              </div>
            )}
            {activeTab === "leaderboard" && (
              <Leaderboard players={players} address={address} />
            )}
          </ScrollArea>
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
