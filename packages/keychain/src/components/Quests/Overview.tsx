import { Box, Flex, Text } from "@chakra-ui/react";
import { QuestState } from "./types";
import { QuestCard } from "./Card";
import { PortalBanner } from "components/PortalBanner";
import { QuestsDuoIcon } from "@cartridge/ui/lib";

export function QuestOverview({
  questsWithProgression,
  onSelect,
}: {
  questsWithProgression: Array<{ quest: any; progress: any }>;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <PortalBanner Icon={QuestsDuoIcon} title="Quests" />

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
                    state={
                      qwp.progress?.completed
                        ? QuestState.Claimable
                        : QuestState.Incomplete
                    }
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

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box w="full" p="0 6px 6px 6px" mt="24px">
    <Text
      color="text.secondaryAccent"
      fontSize="2xs"
      fontWeight="bold"
      lineHeight="16px"
      letterSpacing="0.08em"
      textTransform="uppercase"
    >
      {children}
    </Text>
  </Box>
);
