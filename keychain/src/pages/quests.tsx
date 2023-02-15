import { Box, Circle, Flex, HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import MapIcon from "@cartridge/ui/components/icons/Map";
import Container from "components/Container";
import React, { useMemo } from "react";
import { Header } from "components/Header";
import CircleCheck from "components/icons/CircleCheck";
import { useAccountInfoQuery, useAccountQuestsQuery } from "generated/graphql";
import SparkleOutline from "@cartridge/ui/components/icons/SparkleOutline";
import { constants } from "starknet";

export enum QuestCardState {
  Incomplete,
  Claimable,
  Complete,
}

const QuestCard = ({ name, state, rewards }: { name: string, state: QuestCardState, rewards: Array<any> }) => {
  let bgColor = "gray.700";
  let color = "white";
  let check = false;
  let border = undefined;

  switch (state) {
    case QuestCardState.Claimable:
      bgColor = "gray.600";
      color = "green.400"
      check = true;
      break;
    case QuestCardState.Complete:
      bgColor = "transparent";
      color = "gray.200";
      check = true;
      border = {
        border: "1px solid",
        borderColor: "gray.700",
      };
      break;
    default:
      break;
  }

  return (
    <HStack
      w="full"
      h="54px"
      p="12px 18px 12px 24px"
      bgColor={bgColor}
      color={color}
      fontSize="11px"
      fontWeight="700"
      letterSpacing="0.05em"
      borderRadius="4px"
      textTransform="uppercase"
      userSelect="none"
      {...border}
      _hover={{
        cursor: "pointer",
      }}
    >
      {check && <CircleCheck fontSize="18px" color="currentColor" />}
      <Text color="currentColor">{name}</Text>
      <Spacer />
      {state !== QuestCardState.Complete && (
        <SparkleOutline fontSize="18px" />
      )}
      {state === QuestCardState.Complete && (
        <Text variant="ld-mono-upper" fontSize="10px" textTransform="uppercase" color="currentColor">Completed</Text>
      )}
    </HStack>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box w="full" p="0 6px 6px 6px" mt="24px">
    <Text color="gray.200" fontSize="10px" fontWeight="700" lineHeight="16px" letterSpacing="0.08em" textTransform="uppercase">{children}</Text>
  </Box>
);

const Quests = ({ gameId, address, chainId }: { gameId: string, address: string, chainId: constants.StarknetChainId }) => {

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
        // address="0x077b1680e8f60e5a4020c9a35b193359e040b48ad8d9d98b417c66a9d6f37f96"
        chainId={chainId}
        onClose={() => { }}
      />
      <Box w="full" h="72px" borderBottom="1px solid" borderColor="gray.700" userSelect="none">
        <HStack w="full" spacing="18px" >
          <Circle bgColor="gray.700" size="48px">
            <MapIcon w="30px" h="30px" />
          </Circle>
          <Text as="h1" fontWeight="600" fontSize="17px">Quests</Text>
        </HStack>
      </Box>
      <Flex direction="column" w="full" align="start" gap="12px">
        <>
          <Label>Pending</Label>
          {pendingQuests?.map(({ node: q }) => (
            <QuestCard
              key={q.id}
              name={q.title}
              state={questProgression.find(
                ({ node: qp }) => qp.questID === q.id).node?.completed
                ? QuestCardState.Claimable
                : QuestCardState.Incomplete
              }
              rewards={q.rewards.edges?.map(({ node: r }) => r.id)}
            />
          ))}
          <Label>Completed</Label>
          {completedQuests?.map(({ node: q }) => (
            <QuestCard
              key={q.id}
              name={q.title}
              state={QuestCardState.Complete}
              rewards={q.rewards.edges?.map(({ node: r }) => r.id)}
            />
          ))}
        </>
      </Flex>
    </Container>
  );
};

export default Quests;
