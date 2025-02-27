import { useEffect, useMemo, useState } from "react";
import { TROPHY, PROGRESS } from "#constants";
import { Trophy, Progress, Task } from "#models";
import { useConnection } from "./context";
import { useAccount } from "./account";
import { useProgressions } from "./progressions";
import { useTrophies } from "./trophies";

export interface Item {
  id: string;
  hidden: boolean;
  index: number;
  earning: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  timestamp: number;
  percentage: string;
  completed: boolean;
  pinned: boolean;
  tasks: ItemTask[];
}

export interface ItemTask {
  id: string;
  count: number;
  total: number;
  description: string;
}

export interface Counters {
  [player: string]: { [quest: string]: { count: number; timestamp: number }[] };
}

export interface Stats {
  [quest: string]: number;
}

export interface Player {
  address: string;
  earnings: number;
  timestamp: number;
  completeds: string[];
}

export function useAchievements(accountAddress?: string) {
  const { project, namespace } = useConnection();
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Item[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const currentAddress = useMemo(() => {
    return accountAddress || address;
  }, [accountAddress, address]);

  const { trophies } = useTrophies({
    namespace: namespace ?? "",
    name: TROPHY,
    project: project ?? "",
    parser: Trophy.parse,
  });

  const { progressions } = useProgressions({
    namespace: namespace ?? "",
    name: PROGRESS,
    project: project ?? "",
    parser: Progress.parse,
  });

  // Compute achievements and players
  useEffect(() => {
    if (!Object.values(trophies).length || !currentAddress) return;

    // Compute players and achievement stats
    const data: {
      [playerId: string]: {
        [achievementId: string]: {
          [taskId: string]: {
            completion: boolean;
            timestamp: number;
            count: number;
          };
        };
      };
    } = {};
    Object.values(progressions).forEach((progress: Progress) => {
      const { achievementId, playerId, taskId, taskTotal, total, timestamp } =
        progress;

      // Compute player
      const detaultTasks: { [taskId: string]: boolean } = {};
      const trophy = trophies[achievementId];
      if (!trophy) return;
      trophy.tasks.forEach((task: Task) => {
        detaultTasks[task.id] = false;
      });
      data[playerId] = data[playerId] || {};
      data[playerId][achievementId] =
        data[playerId][achievementId] || detaultTasks;
      data[playerId][achievementId][taskId] = {
        completion: total >= taskTotal,
        timestamp,
        count: total,
      };
    });

    const stats: Stats = {};
    const players: Player[] = [];
    Object.keys(data).forEach((playerId) => {
      const player = data[playerId];
      const completeds: string[] = [];
      let timestamp = 0;
      const earnings = Object.keys(player).reduce((acc, achievementId) => {
        const completion = Object.values(player[achievementId]).every(
          (task) => task.completion,
        );
        if (completion) {
          completeds.push(achievementId);
          stats[achievementId] = stats[achievementId] || 0;
          stats[achievementId] += 1;
          timestamp = Math.max(
            timestamp,
            ...Object.values(player[achievementId]).map(
              (task) => task.timestamp,
            ),
          );
        }
        return acc + (completion ? trophies[achievementId].earning : 0);
      }, 0);
      players.push({
        address: playerId,
        earnings,
        timestamp: timestamp,
        completeds,
      });
    });

    setPlayers(
      Object.values(players)
        .sort((a, b) => a.timestamp - b.timestamp) // Oldest to newest
        .sort((a, b) => b.earnings - a.earnings), // Highest to lowest
    );

    // Compute achievements
    const achievements: Item[] = Object.values(trophies).map(
      (trophy: Trophy) => {
        const achievement = data[currentAddress]?.[trophy.id] || {};
        const completion =
          Object.values(achievement).length > 0 &&
          Object.values(achievement).every((task) => task.completion);
        const timestamp = Math.max(
          ...Object.values(achievement).map((task) => task.timestamp),
        );
        // Compute percentage of players who completed the achievement
        const percentage = (
          players.length ? (100 * (stats[trophy.id] ?? 0)) / players.length : 0
        ).toFixed(0);
        const tasks: ItemTask[] = trophy.tasks.map((task) => {
          return {
            ...task,
            count: achievement[task.id]?.count || 0,
          };
        });
        return {
          id: trophy.id,
          hidden: trophy.hidden,
          index: trophy.index,
          earning: trophy.earning,
          group: trophy.group,
          icon: trophy.icon,
          title: trophy.title,
          description: trophy.description,
          completed: completion,
          percentage,
          timestamp,
          pinned: false,
          tasks,
        };
      },
    );
    setAchievements(
      achievements
        .sort((a, b) => a.index - b.index) // Lowest index to greatest
        .sort((a, b) => (a.id > b.id ? 1 : -1)) // A to Z
        .sort((a, b) => (b.hidden ? -1 : 1) - (a.hidden ? -1 : 1)) // Visible to hidden
        .sort((a, b) => b.timestamp - a.timestamp) // Newest to oldest
        .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0)), // Completed to uncompleted
    );
    // Update loading state
    setIsLoading(false);
  }, [currentAddress, trophies, progressions]);

  return { achievements, players, isLoading };
}
