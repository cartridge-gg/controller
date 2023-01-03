import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  useAccountInfoQuery,
  useAccountQuestsQuery,
  useCheckDiscordQuestsMutation,
  useCheckTwitterQuestsMutation,
} from "generated/graphql";
import { AccountId } from "caip";
import Controller from "utils/controller";
import { addAddressPadding } from "starknet";

export interface QuestData {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt: Date;
  isClaimed: boolean;
  points: number;
  gameId: string;
  parent?: {
    id: string;
    title: string;
    completed: boolean;
  };
  rewards: string[];
  discordGuilds?: string[];
  twitterQuests?: string[];
  metadata?: Partial<{
    callToAction: {
      text: string;
      url: string;
      redirect: boolean;
    };
  }>;
  claimTransaction?: string;
  icon?: React.ReactNode;
}

interface QuestsInterface {
  previousQuests: QuestData[];
  quests: QuestData[];
  error: {};
  refetch: () => void;
}

const QuestsContext = createContext<QuestsInterface>(undefined);

export const useQuests = () => {
  return useContext(QuestsContext);
};

export function QuestsProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const controller = useMemo(() => Controller.fromStore(), []);
  const { data: accountData, error } = useAccountInfoQuery(
    {
      address: addAddressPadding(controller.address),
    },
    {
      enabled: !!controller.address,
    },
  );

  const { mutateAsync: checkTwitterQuests } = useCheckTwitterQuestsMutation();
  const { mutateAsync: checkDiscordQuests } = useCheckDiscordQuestsMutation();

  const accountEdges = accountData?.accounts?.edges;
  const accountName = accountEdges && accountEdges[0]?.node.id;

  const {
    error: questsError,
    data: questsData,
    refetch: questsRefetch,
    isRefetching,
  } = useAccountQuestsQuery(
    {
      accountId: accountName,
    },
    {
      enabled: !!(accountName && accountName.length > 0),
      retry: false,
      staleTime: 3000,
    },
  );

  useEffect(() => {
    if (!accountName) return;

    Promise.all([
      checkTwitterQuests({
        accountId: accountName,
      }),
      checkDiscordQuests({
        accountId: accountName,
      }),
    ]).then(() => questsRefetch());
  }, [
    questsData,
    accountName,
    checkDiscordQuests,
    checkTwitterQuests,
    questsRefetch,
  ]);

  const [quests, setQuests] = useState<QuestData[]>([]);
  const [previousQuests, setPreviousQuests] = useState<QuestData[]>([]);

  useEffect(() => {
    if (isRefetching) {
      setPreviousQuests(quests);
    }
  }, [isRefetching, quests]);

  useEffect(() => {
    const parsedQuests: QuestData[] = questsData?.quests?.edges?.map(
      (questNode) => {
        const quest = questNode.node;
        const progression = questsData.account?.questProgression?.edges.find(
          (prog) => prog.node.questID === quest.id,
        );
        const rewards = quest.rewards.edges?.flatMap((r) => r.node?.id);

        return {
          id: quest.id,
          title: quest.title,
          description: quest.description,
          isCompleted: progression?.node.completed || false,
          isClaimed: progression?.node.claimed || false,
          discordGuilds: quest.discordGuild.map((g) => g.id),
          twitterQuests: quest.twitterQuests.map((t) => t.id),
          points: quest.points,
          rewards: rewards,
          parent: quest.parent && {
            id: quest.parent.id,
            title: quest.parent.title,
            completed:
              questsData.account?.questProgression?.edges.find(
                (q) => q.node.questID === quest.parent.id,
              )?.node.completed || false,
          },
          gameId: quest.game.id,
          metadata: quest.metadata,
          claimTransaction:
            progression?.node?.claimTransaction?.transactionHash,
        } as QuestData;
      },
    );
    setQuests(parsedQuests);
  }, [accountData, questsData]);

  const refetch = () => questsRefetch();

  return (
    <QuestsContext.Provider
      value={{
        quests,
        previousQuests,
        error: questsError,
        refetch,
      }}
    >
      {children}
    </QuestsContext.Provider>
  );
}
