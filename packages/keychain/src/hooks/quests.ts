import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as torii from "@dojoengine/torii-wasm";
import { useConnection } from "@/hooks/connection";
import {
  QuestAdvancement,
  QuestCompletion,
  QuestDefinition,
  RawAdvancement,
  RawCompletion,
  RawDefinition,
  QUEST_DEFINITION,
  QUEST_COMPLETION,
  QUEST_ADVANCEMENT,
  QUEST_CREATION,
  QuestCreation,
  RawCreation,
} from "@/models/quest";
import { getChecksumAddress } from "starknet";
import { useAccount } from "./account";
import { Item, ItemType } from "@/context";

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

const getProgressEntityQuery = (namespace: string, playerId: string) => {
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

export const useQuests = () => {
  const account = useAccount();
  const [client, setClient] = useState<torii.ToriiClient>();
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const { namespace, project } = useConnection();
  const [definitions, setDefinitions] = useState<QuestDefinition[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [advancements, setAdvancements] = useState<QuestAdvancement[]>([]);
  const [creations, setCreations] = useState<QuestCreation[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );
  // const [progressions, setProgressions] = useState<QuestProgression[]>([]);

  useEffect(() => {
    if (!namespace) return;
    const getClient = async () => {
      const client = await new torii.ToriiClient({
        toriiUrl: `https://api.cartridge.gg/x/${project}/torii`,
        worldAddress: "0x0",
      });
      setClient(client);
    };
    getClient();
  }, [project, namespace]);

  const onUpdate = useCallback(
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
        // if (entity.models[`${namespace}-${QUEST_PROGRESSION}`]) {
        //   const model = entity.models[`${namespace}-${QUEST_PROGRESSION}`] as unknown as RawProgression;
        //   setProgressions((prev) => QuestProgression.deduplicate([...prev, QuestProgression.parse(model)]));
        // }
      });
    },
    [namespace],
  );

  const refresh = useCallback(async () => {
    if (!namespace || !client || !account) return;
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }
    // Create queries
    const questEntityQuery = getQuestEntityQuery(namespace);
    const questEventQuery = getQuestEventQuery(namespace);
    const progressEntityQuery = getProgressEntityQuery(
      namespace,
      account.address,
    );
    // Perform subscriptions
    client
      .onEntityUpdated(progressEntityQuery.build().clause, [], onUpdate)
      .then((reponse) => (subscriptionRef.current = reponse));
    // Perform fetches
    client
      .getEntities(questEntityQuery.build())
      .then((result) => onUpdate({ data: result.items, error: undefined }));
    client
      .getEventMessages(questEventQuery.build())
      .then((result) => onUpdate({ data: result.items, error: undefined }));
    client
      .getEntities(progressEntityQuery.build())
      .then((result) => onUpdate({ data: result.items, error: undefined }));
  }, [namespace, client, account, onUpdate]);

  useEffect(() => {
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
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [client, namespace, project, subscriptionRef, refresh, setStatus]);

  const quests: QuestProps[] = useMemo(() => {
    const quests = definitions.map((definition) => {
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
    return quests
      .map((quest) => {
        const unlocked =
          quest.conditions.every(
            (quest) => quests.find((q) => q.id === quest)?.completed,
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

  console.log({ status });

  return {
    quests: quests,
    status,
    refresh,
  };
};
