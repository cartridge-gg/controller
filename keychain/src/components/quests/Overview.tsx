import { Box, HStack, Circle, Flex, Text } from "@chakra-ui/react";
import { QuestCardState } from "pages/quests";
import MapIcon from "@cartridge/ui/components/icons/Map";
import QuestCard from "./Card";

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box w="full" p="0 6px 6px 6px" mt="24px">
    <Text color="gray.200" fontSize="10px" fontWeight="700" lineHeight="16px" letterSpacing="0.08em" textTransform="uppercase">{children}</Text>
  </Box>
);

const QuestsOverview = ({ pending, completed, progression, onSelect }: { pending: any[], completed: any[], progression: any[], onSelect: (id: string) => void }) => {
  return (
    <>
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
          {pending?.map(({ node: q }) => (
            <Box
              key={q.id}
              w="full"
              onClick={() => onSelect(q.id)}
            >
              <QuestCard
                name={q.title}
                state={progression.find(
                  ({ node: qp }) => qp.questID === q.id).node?.completed
                  ? QuestCardState.Claimable
                  : QuestCardState.Incomplete
                }
                rewards={q.rewards.edges?.map(({ node: r }) => r.id)}
              />
            </Box>
          ))}
          <Label>Completed</Label>
          {completed?.map(({ node: q }) => (
            <Box
              w="full"
              key={q.id}
              onClick={() => onSelect(q.id)}
            >
              <QuestCard
                name={q.title}
                state={QuestCardState.Complete}
                rewards={q.rewards.edges?.map(({ node: r }) => r.id)}
              />
            </Box>
          ))}
        </>
      </Flex>
    </>
  );
}

export default QuestsOverview;
