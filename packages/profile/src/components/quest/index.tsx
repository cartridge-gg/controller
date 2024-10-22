import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { ScrollArea, StateIconProps } from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab } from "./tab";
import { useConnection } from "@/hooks/context";
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

export function Quest() {
  const { username, address } = useConnection();
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
    const rank = players.findIndex((player) => player.address === address);
    const earnings =
      players.find((player) => player.address === address)?.earnings || 0;
    return { rank, earnings };
  }, [players, address]);

  useEffect(() => {
    setAchievements(items);
  }, [items]);

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

      <LayoutContent>
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
            <div className="flex flex-col h-full flex-1 overflow-y-auto gap-4 mb-4">
              <Pinneds achievements={pinneds} />
              <Achievements achievements={achievements} onPin={onPin} />
            </div>
          )}
          {activeTab === "leaderboard" && (
            <Leaderboard players={players} address={address} />
          )}
        </ScrollArea>
      </LayoutContent>
    </LayoutContainer>
  );
}
