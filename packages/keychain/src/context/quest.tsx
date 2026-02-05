import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import * as torii from "@dojoengine/torii-wasm";
import { useConnection } from "@/hooks/connection";
import {
  QuestAdvancement,
  QuestCompletion,
  QuestDefinition,
  QuestCreation,
  QuestUnlocked,
  QuestCompleted,
  QuestClaimed,
  RawAdvancement,
  RawCompletion,
  RawDefinition,
  RawCreation,
  RawUnlocked,
  RawCompleted,
  RawClaimed,
  QUEST_DEFINITION,
  QUEST_COMPLETION,
  QUEST_ADVANCEMENT,
  QUEST_CREATION,
  QUEST_UNLOCKED,
  QUEST_COMPLETED,
  QUEST_CLAIMED,
} from "@/models/quest";
import { getChecksumAddress } from "starknet";
import { useAccount } from "@/hooks/account";
import { Item, ItemType } from "@/context/starterpack";
import { useToast } from "@/context/toast";

export type QuestProps = {
  id: string;
  intervalId: number;
  name: string;
  end: number;
  completed: boolean;
  locked: boolean;
  claimed: boolean;
  progression: number;
  registry: string;
  rewards: Item[];
  tasks: {
    description: string;
    total: bigint;
    count: bigint;
  }[];
};

interface QuestContextType {
  quests: QuestProps[];
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

const getQuestEntityQuery = (namespace: string) => {
  const definition: `${string}-${string}` = `${namespace}-${QUEST_DEFINITION}`;
  const clauses = new ClauseBuilder().keys(
    [definition],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getQuestEventQuery = (namespace: string) => {
  const creation: `${string}-${string}` = `${namespace}-${QUEST_CREATION}`;
  const clauses = new ClauseBuilder().keys([creation], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getPlayerEntityQuery = (namespace: string, playerId: string) => {
  const completion: `${string}-${string}` = `${namespace}-${QUEST_COMPLETION}`;
  const advancement: `${string}-${string}` = `${namespace}-${QUEST_ADVANCEMENT}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys(
    [completion, advancement],
    [key],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getPlayerEventQuery = (namespace: string, playerId: string) => {
  const unlocked: `${string}-${string}` = `${namespace}-${QUEST_UNLOCKED}`;
  const completed: `${string}-${string}` = `${namespace}-${QUEST_COMPLETED}`;
  const claimed: `${string}-${string}` = `${namespace}-${QUEST_CLAIMED}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys(
    [unlocked, completed, claimed],
    [key],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const account = useAccount();
  const { toast } = useToast();
  const [client, setClient] = useState<torii.ToriiClient>();
  const entitySubscriptionRef = useRef<torii.Subscription | null>(null);
  const eventSubscriptionRef = useRef<torii.Subscription | null>(null);
  const { namespace, project } = useConnection();
  const [definitions, setDefinitions] = useState<QuestDefinition[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [advancements, setAdvancements] = useState<QuestAdvancement[]>([]);
  const [creations, setCreations] = useState<QuestCreation[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // Initialize Torii client
  useEffect(() => {
    if (!namespace || !project) return;
    const getClient = async () => {
      const client = await new torii.ToriiClient({
        toriiUrl: `https://api.cartridge.gg/x/${project}/torii`,
        worldAddress: "0x0",
      });
      setClient(client);
    };
    getClient();
  }, [project, namespace]);

  // Handler for entity updates (definitions, completions, advancements, creations)
  const onEntityUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${namespace}-${QUEST_DEFINITION}`]) {
          const model = entity.models[
            `${namespace}-${QUEST_DEFINITION}`
          ] as unknown as RawDefinition;
          setDefinitions((prev) =>
            QuestDefinition.deduplicate([
              QuestDefinition.parse(model),
              ...prev,
            ]),
          );
        }
        if (entity.models[`${namespace}-${QUEST_COMPLETION}`]) {
          const model = entity.models[
            `${namespace}-${QUEST_COMPLETION}`
          ] as unknown as RawCompletion;
          setCompletions((prev) =>
            QuestCompletion.deduplicate([
              QuestCompletion.parse(model),
              ...prev,
            ]),
          );
        }
        if (entity.models[`${namespace}-${QUEST_ADVANCEMENT}`]) {
          const model = entity.models[
            `${namespace}-${QUEST_ADVANCEMENT}`
          ] as unknown as RawAdvancement;
          setAdvancements((prev) =>
            QuestAdvancement.deduplicate([
              QuestAdvancement.parse(model),
              ...prev,
            ]),
          );
        }
        if (entity.models[`${namespace}-${QUEST_CREATION}`]) {
          const model = entity.models[
            `${namespace}-${QUEST_CREATION}`
          ] as unknown as RawCreation;
          setCreations((prev) =>
            QuestCreation.deduplicate([QuestCreation.parse(model), ...prev]),
          );
        }
      });
    },
    [namespace],
  );

  // Handler for quest events (unlocked, completed, claimed) - triggers toasts
  const onQuestEvent = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${namespace}-${QUEST_UNLOCKED}`]) {
          const model = entity.models[
            `${namespace}-${QUEST_UNLOCKED}`
          ] as unknown as RawUnlocked;
          const event = QuestUnlocked.parse(model);
          const quest = creations.find(
            (creation) => creation.definition.id === event.quest_id,
          );
          if (quest) {
            toast.quest({
              title: quest.metadata.name,
              subtitle: "New quest unlocked!",
            });
          }
        }
        if (entity.models[`${namespace}-${QUEST_COMPLETED}`]) {
          const model = entity.models[
            `${namespace}-${QUEST_COMPLETED}`
          ] as unknown as RawCompleted;
          const event = QuestCompleted.parse(model);
          const quest = creations.find(
            (creation) => creation.definition.id === event.quest_id,
          );
          if (quest) {
            toast.quest({
              title: quest.metadata.name,
              subtitle: "Quest completed!",
            });
          }
        }
        if (entity.models[`${namespace}-${QUEST_CLAIMED}`]) {
          const model = entity.models[
            `${namespace}-${QUEST_CLAIMED}`
          ] as unknown as RawClaimed;
          const event = QuestClaimed.parse(model);
          const quest = creations.find(
            (creation) => creation.definition.id === event.quest_id,
          );
          if (quest) {
            toast.quest({
              title: quest.metadata.name,
              subtitle: "Quest claimed!",
            });
          }
        }
      });
    },
    [namespace, toast, creations],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!namespace || !client || !account) return;

    // Cancel existing subscriptions
    if (entitySubscriptionRef.current) {
      entitySubscriptionRef.current = null;
    }
    if (eventSubscriptionRef.current) {
      eventSubscriptionRef.current = null;
    }

    // Create queries
    const questEntityQuery = getQuestEntityQuery(namespace);
    const questEventQuery = getQuestEventQuery(namespace);
    const playerEventQuery = getPlayerEventQuery(namespace, account.address);
    const playerEntityQuery = getPlayerEntityQuery(namespace, account.address);

    // Fetch initial data
    await Promise.all([
      client
        .getEntities(questEntityQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
      client
        .getEventMessages(questEventQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
      client
        .getEntities(playerEntityQuery.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
    ]);

    // Subscribe to entity and event updates
    if (!creations.length) return;
    client
      .onEventMessageUpdated(playerEventQuery.build().clause, [], onQuestEvent)
      .then((response) => (eventSubscriptionRef.current = response));
    client
      .onEntityUpdated(playerEntityQuery.build().clause, [], onEntityUpdate)
      .then((response) => (entitySubscriptionRef.current = response));
  }, [namespace, client, account, onEntityUpdate, onQuestEvent, creations]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (
      !namespace ||
      !project ||
      entitySubscriptionRef.current ||
      eventSubscriptionRef.current
    )
      return;
    setStatus("loading");
    refresh()
      .then(() => {
        setStatus("success");
      })
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });

    return () => {
      if (entitySubscriptionRef.current) {
        entitySubscriptionRef.current.cancel();
      }
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.cancel();
      }
    };
  }, [refresh, namespace, project]);

  // Compute quests from the raw data
  const quests: QuestProps[] = useMemo(() => {
    const questList = definitions.map((definition) => {
      const intervalId = definition.getIntervalId();
      const creation = creations.find(
        (creation) => creation.definition.id === definition.id,
      );
      const completion = completions.find(
        (completion) =>
          completion.quest_id === definition.id &&
          completion.interval_id === intervalId,
      );
      return {
        id: definition.id,
        intervalId: intervalId || 0,
        name: creation?.metadata.name || "Quest",
        registry: creation?.metadata.registry || "",
        end: definition.getNextEnd() || 0,
        completed: (completion?.timestamp || 0) > 0,
        claimed: !!completion && !completion.unclaimed,
        locked: (completion?.lock_count || 0) > 0,
        conditions: definition.conditions,
        progression: 0,
        rewards: (creation?.metadata.rewards || []).map((reward) => ({
          title: reward.name,
          subtitle: reward.description,
          icon: reward.icon,
          type: "NFT" as ItemType,
        })),
        tasks: definition.tasks.map((task) => {
          const advancement = advancements.find(
            (advancement) =>
              advancement.quest_id === definition.id &&
              advancement.task_id === task.id &&
              advancement.interval_id === intervalId,
          );
          return {
            description: task.description,
            total: task.total,
            count: advancement?.count || 0n,
          };
        }),
      };
    });

    return questList
      .map((quest) => {
        const unlocked =
          quest.conditions.every(
            (questId) => questList.find((q) => q.id === questId)?.completed,
          ) || false;
        return {
          ...quest,
          locked: !unlocked,
          progression: quest.tasks.reduce(
            (acc, task) =>
              acc + (Number(task.count) / Number(task.total)) * 100,
            0,
          ),
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id))
      .sort((a, b) => (a.end > b.end ? 1 : -1))
      .sort((a, b) => b.progression - a.progression)
      .sort((a, b) => (a.completed && !b.completed ? -1 : 1));
  }, [definitions, completions, advancements, creations]);

  const value: QuestContextType = {
    quests,
    status,
    refresh,
  };

  return (
    <QuestContext.Provider value={value}>{children}</QuestContext.Provider>
  );
}

export function useQuestContext() {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error("useQuestContext must be used within a QuestProvider");
  }
  return context;
}
