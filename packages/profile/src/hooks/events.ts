import { useEffect, useState } from "react";
import { Event, EventNode, useEventsQuery } from "@cartridge/utils/api/indexer";
import { Creation, Completion } from "@/models";
import { hash, byteArray, ByteArray } from "starknet";

// Computes dojo selector from namespace and event name
function getSelectorFromTag(namespace: string, event: string): string {
  return hash.computePoseidonHashOnElements([
    computeByteArrayHash(namespace),
    computeByteArrayHash(event),
  ]);
}

// Poseidon hash of a string representated as a ByteArray
function computeByteArrayHash(str: string): string {
  const bytes = byteArray.byteArrayFromString(str);
  return hash.computePoseidonHashOnElements(serializeByteArray(bytes));
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

export function useEvents<TEvent extends Creation | Completion>({
  namespace,
  name,
  limit,
  parse,
}: {
  namespace: string;
  name: string;
  limit: number;
  parse: (node: EventNode) => TEvent;
}) {
  const [offset, setOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [nodes, setNodes] = useState<{ [key: string]: boolean }>({});
  const [events, setEvents] = useState<TEvent[]>([]);

  // Fetch achievement creations from raw events
  const { refetch: fetchEvents } = useEventsQuery(
    {
      keys: [getSelectorFromTag(namespace, name)],
      limit,
      offset,
    },
    {
      enabled: false,
      onSuccess: ({ events }: { events: Event }) => {
        // Update offset
        if (events.pageInfo.hasNextPage) {
          setOffset(offset + limit);
        } else {
          setIsFetching(false);
        }
        // Parse the events
        const results: TEvent[] = [];
        events.edges.forEach(({ node }: { node: EventNode }) => {
          // Update parsed events to avoid duplicates, skip if already done
          if (nodes[node.id]) return;
          setNodes((previous) => ({ ...previous, [node.id]: true }));
          // Push event
          results.push(parse(node));
        });
        setEvents((previous) => [...previous, ...results]);
      },
    },
  );

  useEffect(() => {
    fetchEvents();
  }, [offset, fetchEvents]);

  return { events, isFetching };
}
