import Container from "components/Container";
import { useMemo, useState } from "react";
import { Header } from "components/Header";
import { useAccountInfoQuery, useAccountQuestsQuery } from "generated/graphql";
import { constants } from "starknet";
import QuestOverview from "components/quests/Overview";

export enum QuestCardState {
  Incomplete,
  Claimable,
  Complete,
}

const Quests = ({ gameId, address, chainId, onClose }: { gameId: string, address: string, chainId: constants.StarknetChainId, onClose: () => void }) => {

  const [selectedQuestId, setSelectedQuestId] = useState<string>();
  const { data: accountData } = useAccountInfoQuery({ address: "0x077b1680e8f60e5a4020c9a35b193359e040b48ad8d9d98b417c66a9d6f37f96" });
  const accountId = accountData?.accounts?.edges[0]?.node.id;
  // const accountId = "sam";
  const { data: questData } = useAccountQuestsQuery({ accountId: accountId || "", gameId });
  const questProgression = questData?.account?.questProgression?.edges;
  const quests = questData?.quests?.edges;

  const completedQuests = useMemo(() => {
    const cqs = questProgression?.map(({ node: q }) => {
      if (q.claimed) {
        return quests.find(({ node: qq }) => q.questID === qq.id);
      }
    });
    return cqs?.filter((cq) => !!cq);
  }, [quests, questProgression]);

  const pendingQuests = useMemo(() => {
    if (quests) {
      return quests.filter(({ node: q }) => {
        const quest = questProgression.find(({ node: qp }) => qp.questID === q.id);
        if (!quest.node?.claimed) {
          return quest;
        }
      });
    }
  }, [quests, questProgression]);

  return (
    <Container>
      <Header
        address={address}
        chainId={chainId}
        onClose={onClose}
        onBack={!!selectedQuestId
          ? () => setSelectedQuestId(null)
          : undefined
        }
      />
      {!selectedQuestId ? (
        <QuestOverview
          pending={pendingQuests}
          completed={completedQuests}
          progression={questProgression}
          onSelect={(id: string) => setSelectedQuestId(id)}
        />
      ) : (
        <></>
      )}
    </Container>
  );
};

export default Quests;
