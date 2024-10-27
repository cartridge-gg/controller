import { useEffect, useState } from "react";
import { ACHIEVEMENT_COMPLETION, ACHIEVEMENT_CREATION } from "@/constants";
import { useEvents } from "./events";
import { Creation, Completion } from "@/models";

// Number of events to fetch at a time, could be increased if needed
const LIMIT = 100;

export interface Item {
  id: string;
  quest: string;
  title: string;
  description: string;
  count: number;
  earning: number;
  timestamp: number;
  percentage: string;
  completed: boolean;
  hidden: boolean;
  pinned: boolean;
  total: number;
  icon: string;
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

export function useAchievements({
  namespace,
  address,
}: {
  namespace: string;
  address: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Item[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const { events: creations, isFetching: isFetchingCreations } =
    useEvents<Creation>({
      namespace,
      name: ACHIEVEMENT_CREATION,
      limit: LIMIT,
      parse: Creation.parse,
    });
  const { events: completions, isFetching: isFetchingCompletions } =
    useEvents<Completion>({
      namespace,
      name: ACHIEVEMENT_COMPLETION,
      limit: LIMIT,
      parse: Completion.parse,
    });

  // Compute achievements and players
  useEffect(() => {
    if (
      isFetchingCreations ||
      isFetchingCompletions ||
      !creations.length ||
      !address
    )
      return;

    // Compute counters
    const counters: Counters = {};
    completions.forEach(({ player, quest, count, timestamp }) => {
      counters[player] = counters[player] || {};
      counters[player][quest] = counters[player][quest] || [];
      counters[player][quest].push({ count, timestamp });
    });

    // Compute players and achievement stats
    const stats: Stats = {};
    const players: Player[] = Object.keys(counters)
      .map((playerAddress) => {
        let timestamp = 0;
        const earnings = creations.reduce(
          (total: number, creation: Creation) => {
            // Compute at which timestamp the latest achievement was completed
            let count = 0;
            let completed = false;
            counters[playerAddress]?.[creation.quest]
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
                  if (!completed && count >= creation.total) {
                    timestamp = t > timestamp ? t : timestamp;
                    completed = true;
                  }
                },
              );
            // Update stats
            stats[creation.quest] = stats[creation.quest] || 0;
            stats[creation.quest] += completed ? 1 : 0;
            return completed ? total + creation.earning : total;
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
    const achievements: Item[] = creations
      .map((creation) => {
        // Compute at which timestamp the achievement was completed
        let count = 0;
        let timestamp = 0;
        let completed = false;
        counters[address]?.[creation.quest]
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
              if (!completed && count >= creation.total) {
                timestamp = t;
                completed = true;
              }
            },
          );
        // Compute percentage of players who completed the achievement
        const percentage = (
          (100 * stats[creation.quest]) /
          players.length
        ).toFixed(0);
        return {
          ...creation,
          count,
          completed,
          percentage,
          timestamp,
          pinned: false,
        };
      })
      .sort((a, b) => (a.id > b.id ? 1 : -1)) // A to Z
      .sort((a, b) => (b.hidden ? -1 : 1) - (a.hidden ? -1 : 1)) // Visible to hidden
      .sort((a, b) => b.timestamp - a.timestamp) // Newest to oldest
      .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0)); // Completed to uncompleted
    setAchievements(achievements);
    // Update loading state
    setIsLoading(false);
  }, [
    address,
    creations,
    completions,
    isFetchingCreations,
    isFetchingCompletions,
  ]);

  return { achievements, players, isLoading };
}
