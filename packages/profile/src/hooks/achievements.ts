import { useEffect, useState } from "react";
import { Event, EventNode, useEventsQuery } from "@cartridge/utils/api/indexer";
import { hash, byteArray, ByteArray, shortString } from "starknet";
import { ACHIEVEMENT_COMPLETION, ACHIEVEMENT_CREATION } from "@/constants";

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

function parseAchievementCreation(node: EventNode): Creation {
  const length = parseInt(node.data[5]);
  const data = node.data.slice(6, 6 + length);
  return {
    id: shortString.decodeShortString(node.keys[1]),
    quest: shortString.decodeShortString(node.data[0]),
    hidden: !parseInt(node.data[1]) ? false : true,
    earning: parseInt(node.data[2]),
    total: parseInt(node.data[3]),
    title: shortString.decodeShortString(node.data[4]),
    description: byteArray.stringFromByteArray({
      data: data,
      pending_word: node.data[6 + length],
      pending_word_len: node.data[7 + length],
    }),
    icon: shortString.decodeShortString(node.data[8 + length]),
    timestamp: parseInt(node.data[9 + length]),
  };
}

function parseAchievementCompletion(node: EventNode): Completion {
  return {
    player: node.keys[1],
    quest: shortString.decodeShortString(node.keys[2]),
    count: parseInt(node.data[0]),
    timestamp: parseInt(node.data[1]),
  };
}

export function useAchievements({
  namespace,
  address,
}: {
  namespace: string;
  address: string;
}) {
  const [offsetCreations, setOffsetCreations] = useState(0);
  const [offsetCompletions, setOffsetCompletions] = useState(0);
  const [isFetchingCreations, setIsFetchingCreations] = useState(true);
  const [isFetchingCompletions, setIsFetchingCompletions] = useState(true);
  const [achievements, setAchievements] = useState<Item[]>([]);
  const [nodes, setNodes] = useState<{ [key: string]: boolean }>({});
  const [creations, setCreations] = useState<Creation[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [counters, setCounters] = useState<Counters>({});
  const [players, setPlayers] = useState<Player[]>([]);

  // Fetch achievement creations from raw events
  const { refetch: fetchAchievementCreations } = useEventsQuery(
    {
      keys: [getSelectorFromTag(namespace, ACHIEVEMENT_CREATION)],
      limit: LIMIT,
      offset: offsetCreations,
    },
    {
      enabled: false,
      onSuccess: ({ events }: { events: Event }) => {
        // Update offset
        if (events.pageInfo.hasNextPage) {
          setOffsetCreations(offsetCreations + LIMIT);
        } else {
          setIsFetchingCreations(false);
        }
        // Parse the events
        const creations: Creation[] = [];
        events.edges.forEach(({ node }: { node: EventNode }) => {
          // Update parsed events to avoid duplicates, skip if already done
          if (nodes[node.id]) return;
          setNodes((previous) => ({ ...previous, [node.id]: true }));
          // Push event
          creations.push(parseAchievementCreation(node));
        });
        setCreations((previous) => [...previous, ...creations]);
      },
    },
  );

  // Fetch achievement completions from raw events
  const { refetch: fetchAchievementCompletions } = useEventsQuery(
    {
      keys: [getSelectorFromTag(namespace, ACHIEVEMENT_COMPLETION)],
      limit: LIMIT,
      offset: offsetCompletions,
    },
    {
      enabled: false,
      onSuccess: ({ events }: { events: Event }) => {
        // Update offset
        if (events.pageInfo.hasNextPage) {
          setOffsetCompletions(offsetCompletions + LIMIT);
        } else {
          setIsFetchingCompletions(false);
        }
        // Parse the events
        const counters: Counters = {};
        const completions: Completion[] = [];
        events.edges.forEach(({ node }: { node: EventNode }) => {
          // Update parsed events to avoid duplicates, skip if already done
          if (nodes[node.id]) return;
          setNodes((previous) => ({ ...previous, [node.id]: true }));
          // Parse event
          const completion = parseAchievementCompletion(node);
          // Update counters
          counters[completion.player] = counters[completion.player] || {};
          counters[completion.player][completion.quest] =
            counters[completion.player][completion.quest] || [];
          counters[completion.player][completion.quest].push({
            count: completion.count,
            timestamp: completion.timestamp,
          });
          // Push event
          completions.push(completion);
        });
        setCompletions((previous) => [...previous, ...completions]);
        setCounters(counters);
      },
    },
  );

  // Compute achievements and players
  useEffect(() => {
    if (
      isFetchingCreations ||
      isFetchingCompletions ||
      !creations.length ||
      !address
    )
      return;

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
      .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
    setAchievements(achievements);
  }, [
    address,
    creations,
    completions,
    counters,
    isFetchingCreations,
    isFetchingCompletions,
  ]);

  useEffect(() => {
    fetchAchievementCreations();
  }, [offsetCreations, fetchAchievementCreations]);

  useEffect(() => {
    fetchAchievementCompletions();
  }, [offsetCompletions, fetchAchievementCompletions]);

  return { achievements, players };
}
