import { Box, HStack, Circle, Flex, Text } from "@chakra-ui/react";
import { QuestState } from "pages/quests";
import MapIcon from "@cartridge/ui/components/icons/Map";
import QuestCard from "./Card";

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box w="full" p="0 6px 6px 6px" mt="24px">
    <Text color="gray.200" fontSize="10px" fontWeight="700" lineHeight="16px" letterSpacing="0.08em" textTransform="uppercase">{children}</Text>
  </Box>
);

const QuestsOverview = ({ questsWithProgression, onSelect }: { questsWithProgression: Array<{ quest: any, progress: any }>, onSelect: (id: string) => void }) => {
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
          {questsWithProgression?.map((qwp) => {
            if (!qwp.progress?.claimed) {
              return (
                <Box
                  key={qwp.quest.id}
                  w="full"
                  onClick={() => onSelect(qwp.quest.id)}
                >
                  <QuestCard
                    name={qwp.quest.title}
                    state={qwp.progress?.completed
                      ? QuestState.Claimable
                      : QuestState.Incomplete
                    }
                    rewards={qwp.quest.rewards.edges?.map((r) => r.id)}
                  />
                </Box>
              );
            }
          })}
          <Label>Completed</Label>
          {questsWithProgression?.map((qwp) => {
            if (qwp.progress?.claimed) {
              return (
                <Box
                  w="full"
                  key={qwp.quest.id}
                  onClick={() => onSelect(qwp.quest.id)}
                >
                  <QuestCard
                    name={qwp.quest.title}
                    state={QuestState.Complete}
                    rewards={qwp.quest.rewards.edges?.map((r) => r.id)}
                  />
                </Box>
              );
            }
          })}
        </>
      </Flex>
    </>
  );
}

export default QuestsOverview;
