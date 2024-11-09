import { useEffect, useMemo, useState } from "react";
import { TROPHY, PROGRESS } from "@/constants";
import { useEvents } from "./events";
import { Trophy, Progress } from "@/models";
import { AchievementTask } from "@/components/trophies/achievement";
import { useConnection } from "./context";
import { useAccount } from "./account";

// Number of events to fetch at a time, could be increased if needed
const LIMIT = 1000;

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
  tasks: AchievementTask[];
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
}

export function useAchievements(accountAddress?: string) {
  const { namespace } = useConnection();
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Item[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const currentAddress = useMemo(() => {
    return accountAddress || address;
  }, [accountAddress, address]);

  const { events: trophies, isFetching: isFetchingTrophiess } =
    useEvents<Trophy>({
      namespace: namespace || "",
      name: TROPHY,
      limit: LIMIT,
      parse: Trophy.parse,
    });
  const { events: progresses, isFetching: isFetchingProgresses } =
    useEvents<Progress>({
      namespace: namespace || "",
      name: PROGRESS,
      limit: LIMIT,
      parse: Progress.parse,
    });

  // Compute achievements and players
  useEffect(() => {
    if (
      isFetchingTrophiess ||
      isFetchingProgresses ||
      !trophies.length ||
      !currentAddress
    )
      return;

    // Compute counters
    const counters: Counters = {};
    progresses.forEach(({ player, task, count, timestamp }) => {
      counters[player] = counters[player] || {};
      counters[player][task] = counters[player][task] || [];
      counters[player][task].push({ count, timestamp });
    });

    // Compute players and achievement stats
    const dedupedTrophies = trophies.filter(
      (trophy, index) =>
        trophies.findIndex((t) => t.id === trophy.id) === index,
    );
    const stats: Stats = {};
    const players: Player[] = Object.keys(counters)
      .map((playerAddress) => {
        let timestamp = 0;
        const earnings = dedupedTrophies.reduce(
          (total: number, trophy: Trophy) => {
            // Compute at which timestamp the latest achievement was completed
            let completed = true;
            trophy.tasks.forEach((task) => {
              let count = 0;
              let completion = false;
              counters[playerAddress]?.[task.id]
                ?.sort((a, b) => a.timestamp - b.timestamp)
                .forEach(
                  ({
                    count: c,
                    timestamp: t,
                  }: {
                    count: number;
                    timestamp: number;
                  }) => {
                    count += c;
                    if (!completion && count >= task.total) {
                      timestamp = t > timestamp ? t : timestamp;
                      completion = true;
                    }
                  },
                );
              completed = completed && completion;
            });
            // Update stats
            stats[trophy.id] = stats[trophy.id] || 0;
            stats[trophy.id] += completed ? 1 : 0;
            return completed ? total + trophy.earning : total;
          },
          0,
        );
        return {
          address: playerAddress,
          earnings,
          timestamp,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp) // Oldest to newest
      .sort((a, b) => b.earnings - a.earnings); // Highest to lowest
    setPlayers(players);

    // Compute achievements
    const achievements: Item[] = dedupedTrophies
      .map((trophy) => {
        // Compute at which timestamp the achievement was completed
        let timestamp = 0;
        let completed = true;
        const tasks: AchievementTask[] = [];
        trophy.tasks.forEach((task) => {
          let count = 0;
          let completion = false;
          counters[currentAddress]?.[task.id]
            ?.sort((a, b) => a.timestamp - b.timestamp)
            .forEach(
              ({
                count: c,
                timestamp: t,
              }: {
                count: number;
                timestamp: number;
              }) => {
                count += c;
                if (!completion && count >= task.total) {
                  timestamp = t;
                  completion = true;
                }
              },
            );
          tasks.push({
            id: task.id,
            count,
            total: task.total,
            description: task.description,
          });
          completed = completed && completion;
        });
        // Compute percentage of players who completed the achievement
        const percentage = (
          players.length ? (100 * stats[trophy.id]) / players.length : 0
        ).toFixed(0);
        return {
          ...trophy,
          completed,
          percentage,
          timestamp,
          pinned: false,
          tasks,
        };
      })
      .sort((a, b) => a.index - b.index) // Lowest index to greatest
      .sort((a, b) => (a.id > b.id ? 1 : -1)) // A to Z
      .sort((a, b) => (b.hidden ? -1 : 1) - (a.hidden ? -1 : 1)) // Visible to hidden
      .sort((a, b) => b.timestamp - a.timestamp) // Newest to oldest
      .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0)); // Completed to uncompleted
    setAchievements(achievements);
    // Update loading state
    setIsLoading(false);
  }, [
    currentAddress,
    trophies,
    progresses,
    isFetchingTrophiess,
    isFetchingProgresses,
  ]);

  return { achievements, players, isLoading };
}
