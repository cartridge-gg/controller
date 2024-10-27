import { useEffect, useState } from "react";
import { Event, useEventsQuery } from "@cartridge/utils/api/indexer";
import { hash, byteArray, ByteArray, shortString } from "starknet";
import { EventEdge } from "@cartridge/utils/api/indexer";
import { ACHIEVEMENT_COMPLETION, ACHIEVEMENT_CREATION } from "@/constants";

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

export interface Creation {
  id: string;
  quest: string;
  title: string;
  description: string;
  earning: number;
  hidden: boolean;
  total: number;
  icon: string;
  timestamp: number;
}

export interface Completion {
  player: string;
  quest: string;
  count: number;
  timestamp: number;
}

export interface Counters {
  [player: string]: { [quest: string]: number };
}

export interface Stats {
  [quest: string]: number;
}

export interface Player {
  address: string;
  earnings: number;
  timestamp: number;
}

// Computes dojo selector from namespace and event name
function getSelectorFromTag(namespace: string, event: string): string {
  return hash.computePoseidonHashOnElements([
    computeByteArrayHash(namespace),
    computeByteArrayHash(event),
  ]);
}

// Serializes a ByteArray to a bigint array
function serializeByteArray(byteArray: ByteArray): bigint[] {
  const result: bigint[] = [
    BigInt(byteArray.data.length),
    ...byteArray.data.map((word) => BigInt(word.toString())),
    BigInt(byteArray.pending_word),
    BigInt(byteArray.pending_word_len),
  ];
  return result;
}

// Poseidon hash of a string representated as a ByteArray
function computeByteArrayHash(str: string): string {
  const bytes = byteArray.byteArrayFromString(str);
  return hash.computePoseidonHashOnElements(serializeByteArray(bytes));
}

export function useAchievements({
  namespace,
  address,
}: {
  namespace: string;
  address: string;
}) {
  const [achievements, setAchievements] = useState<Item[]>([]);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [counters, setCounters] = useState<Counters>({});
  const [players, setPlayers] = useState<Player[]>([]);

  // Fetch achievement creations from raw events
  const { refetch: fetchAchievementCreations } = useEventsQuery(
    {
      keys: [getSelectorFromTag(namespace, ACHIEVEMENT_CREATION)],
      limit: 100,
      offset: 0,
    },
    {
      enabled: false,
      onSuccess: ({ events }: { events: Event }) => {
        // Parse the events
        const creations: Creation[] = events.edges.map((edge: EventEdge) => {
          const length = parseInt(edge.node.data[5]);
          const data = edge.node.data.slice(6, 6 + length);
          const creation: Creation = {
            id: shortString.decodeShortString(edge.node.keys[1]),
            quest: shortString.decodeShortString(edge.node.data[0]),
            hidden: !parseInt(edge.node.data[1]) ? false : true,
            earning: parseInt(edge.node.data[2]),
            total: parseInt(edge.node.data[3]),
            title: shortString.decodeShortString(edge.node.data[4]),
            description: byteArray.stringFromByteArray({
              data: data,
              pending_word: edge.node.data[6 + length],
              pending_word_len: edge.node.data[7 + length],
            }),
            icon: shortString.decodeShortString(edge.node.data[8 + length]),
            timestamp: parseInt(edge.node.data[9 + length]) * 1000,
          };
          return creation;
        });
        setCreations(
          creations
            .sort((a, b) => (a.id > b.id ? 1 : -1)) // A to Z
            .sort((a, b) => (b.hidden ? -1 : 1) - (a.hidden ? -1 : 1)) // Visible to hidden
            .sort((a, b) => b.timestamp - a.timestamp),
        ); // Newest to oldest
      },
    },
  );

  // Fetch achievement completions from raw events
  const { refetch: fetchAchievementCompletions } = useEventsQuery(
    {
      keys: [getSelectorFromTag(namespace, ACHIEVEMENT_COMPLETION)],
      limit: 100,
      offset: 0,
    },
    {
      enabled: false,
      onSuccess: ({ events }: { events: Event }) => {
        const counters: Counters = {};
        const completions = events.edges
          .map((edge: EventEdge) => {
            // Compute completion object
            const completion = {
              player: edge.node.keys[1],
              quest: shortString.decodeShortString(edge.node.keys[2]),
              count: parseInt(edge.node.data[0]),
              timestamp: parseInt(edge.node.data[1]) * 1000,
            };
            // Update counters
            counters[completion.player] = counters[completion.player] || {};
            counters[completion.player][completion.quest] =
              counters[completion.player][completion.quest] || 0;
            counters[completion.player][completion.quest] += completion.count;
            // Return completion object
            return completion;
          })
          .sort((a, b) => a.timestamp - b.timestamp); // Oldest to newest
        setCompletions(completions);
        setCounters(counters);
      },
    },
  );

  // Compute achievements and players
  useEffect(() => {
    if (!creations.length || !address) return;

    // Compute players and achievement stats
    const stats: Stats = {};
    const players: Player[] = Object.keys(counters)
      .map((playerAddress) => {
        const earnings = creations.reduce(
          (total: number, creation: Creation) => {
            const count = counters[playerAddress]?.[creation.quest] || 0;
            const completed = count >= creation.total;
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
          timestamp: 0,
        };
      })
      .sort((a, b) => b.earnings - a.earnings);
    console.log("players", players);
    setPlayers(players);

    // Compute achievements
    const achievements: Item[] = creations
      .map((creation) => {
        const count = counters[address]?.[creation.quest] || 0;
        const completed = count >= creation.total;
        const percentage = (
          (100 * stats[creation.quest]) /
          players.length
        ).toFixed(0);
        return {
          ...creation,
          count,
          completed,
          percentage,
          timestamp: 0,
          pinned: false,
        };
      })
      .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
    console.log("achievements", achievements);
    setAchievements(achievements);
  }, [address, creations, completions, counters]);

  useEffect(() => {
    fetchAchievementCreations();
    fetchAchievementCompletions();
  }, [fetchAchievementCreations, fetchAchievementCompletions]);

  return { achievements, players };
}
