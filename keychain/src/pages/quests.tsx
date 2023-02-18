import Container from "components/Container";
import { useEffect, useMemo, useState } from "react";
import { Header } from "components/Header";
import { useAccountInfoQuery, useAccountQuestsQuery } from "generated/graphql";
import { constants } from "starknet";
import QuestOverview from "components/quests/Overview";
import QuestDetails from "components/quests/Details";

export enum QuestState {
  Incomplete,
  Claimable,
  Complete,
}

const Quests = ({
  gameId,
  address,
  chainId,
  onClose,
}: {
  gameId: string;
  address: string;
  chainId: constants.StarknetChainId;
  onClose: () => void;
}) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>();
  const [questsWithProgression, setQuestsWithProgression] =
    useState<Array<{ quest: any; progress: any }>>();
  const { data: accountData } = useAccountInfoQuery({ address });
  const accountId = accountData?.accounts?.edges[0]?.node.id;
  const { data: questData, refetch: refetchQuests } = useAccountQuestsQuery(
    { accountId, gameId },
    {
      enabled: !!accountId,
    },
  );
  const questProgression = questData?.account?.questProgression?.edges;
  const quests = questData?.quests?.edges;

  useEffect(() => {
    const qwp: Array<{ quest: any; progress: any }> = [];
    quests?.forEach(({ node: q }) => {
      const progress = questProgression.find(
        ({ node: qp }) => qp.questID === q.id,
      );
      qwp.push({
        quest: q,
        progress: progress?.node ?? null,
      });
    });
    setQuestsWithProgression(qwp);
  }, [quests, questProgression]);

  return (
    <Container>
      <Header
        address={address}
        chainId={chainId}
        onClose={onClose}
        onBack={!!selectedQuestId ? () => setSelectedQuestId(null) : undefined}
      />
      {!selectedQuestId ? (
        <QuestOverview
          questsWithProgression={questsWithProgression}
          onSelect={(id: string) => setSelectedQuestId(id)}
        />
      ) : (
        <QuestDetails
          questsWithProgress={questsWithProgression}
          selectedId={selectedQuestId}
          address={address}
          onClaim={() => refetchQuests()}
        />
      )}
    </Container>
  );
};

export default Quests;
