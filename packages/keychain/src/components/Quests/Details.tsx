import { Box, Button, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { QuestState } from "./types";
import { useEffect, useState } from "react";
import { useClaimQuestRewardsMutation } from "generated/graphql";
import {
  CheckIcon,
  CircleCheckIcon,
  CircleNoCheckIcon,
  QuestsDuoIcon,
  SparklesIcon,
} from "@cartridge/ui";
import { PortalBanner } from "components/PortalBanner";

export function QuestDetails({
  questsWithProgress,
  selectedId,
  address,
  onClaim,
}: {
  questsWithProgress: Array<{ quest: any; progress: any }>;
  selectedId: string;
  address: string;
  onClaim: () => void;
}) {
  const [quest, setQuest] = useState<any>();
  const [questState, setQuestState] = useState<QuestState>();
  const [questProgress, setQuestProgress] = useState<any>();
  const { mutateAsync } = useClaimQuestRewardsMutation();

  useEffect(() => {
    const q = questsWithProgress.find((qwp) => qwp.quest.id === selectedId);
    setQuest(q.quest);
    setQuestProgress(q.progress);
    setQuestState(
      q.progress?.claimed
        ? QuestState.Complete
        : q.progress?.completed
        ? QuestState.Claimable
        : QuestState.Incomplete,
    );
  }, [questsWithProgress, selectedId]);

  if (quest === undefined) {
    return <></>;
  }

  return (
    <Flex direction="column" w="full" minH="515px">
      <Box
        overflowY="auto"
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Flex direction="column" py="36px" gap="24px">
          <Box
            w="full"
            minH="72px"
            borderBottom="1px solid"
            borderColor="solid.primary"
            userSelect="none"
          >
            <PortalBanner Icon={QuestsDuoIcon} title={quest?.node?.title} />

            <HStack
              my="24px"
              color={
                typeof questState === "undefined" ||
                questState === QuestState.Incomplete
                  ? "translucent.heavy"
                  : "green.400"
              }
            >
              <Tag>
                {typeof questState !== "undefined" ||
                  (questState !== QuestState.Incomplete && (
                    <CheckIcon mr="6px" />
                  ))}
                {typeof questState === "undefined" ||
                questState === QuestState.Incomplete
                  ? "incomplete"
                  : "completed"}
              </Tag>
            </HStack>
          </Box>

          <Flex
            minH="130px"
            p="24px"
            direction="column"
            align="start"
            gap="18px"
            bgColor="solid.primary"
            borderRadius="4px"
            boxShadow="0px 69px 28px rgba(0, 0, 0, 0.01), 0px 39px 23px rgba(0, 0, 0, 0.05), 0px 17px 17px rgba(0, 0, 0, 0.09), 0px 4px 10px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);"
          >
            <Tag>Requirements</Tag>
            {quest.questEvents?.length &&
              quest.questEvents?.map((evt) => {
                const eventProgress = questProgress?.completion?.find(
                  (c) => c.questEvent === evt.id,
                );
                return (
                  <HStack key={evt.id}>
                    {eventProgress?.completed ? (
                      <CircleCheckIcon color="green.400" />
                    ) : (
                      <CircleNoCheckIcon color="text.secondary" />
                    )}
                    <Text
                      fontSize="12px"
                      color={
                        eventProgress?.completed
                          ? "green.400"
                          : "text.secondary"
                      }
                      fontWeight="700"
                    >
                      {evt.description}
                    </Text>
                  </HStack>
                );
              })}
          </Flex>
          <Flex direction="column" align="start" gap="24px">
            <Tag>Rewards</Tag>
            {quest.points && (
              <Reward
                icon={<SparklesIcon variant="line" />}
                amount={quest.points}
                name="XP"
              />
            )}
          </Flex>
        </Flex>
      </Box>
      <Box w="full" h="65px" borderTop="1px solid" borderColor="solid.primary">
        <Button
          w="full"
          mt="24px"
          disabled={questState !== QuestState.Claimable || !address}
          onClick={() => {
            mutateAsync({
              accountId: `starknet:SN_SEPOLIA:${address}`,
              questId: selectedId,
            })
              .then((res) => {
                onClaim();
              })
              .catch((err) => console.error(err));
          }}
        >
          Claim
        </Button>
      </Box>
    </Flex>
  );
}

const Tag = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      bgColor="translucent.soft"
      color="currentColor"
      py={1.5}
      px={3}
      textTransform="uppercase"
      fontSize="2xl"
      fontWeight="bold"
      letterSpacing="0.1em"
      borderRadius="4px"
    >
      {children}
    </Box>
  );
};

const Reward = ({
  icon,
  name,
  amount,
}: {
  icon: React.ReactNode;
  name: string;
  amount: string;
}) => {
  return (
    <VStack w="90px" h="84px" borderRadius="6px" spacing="0" overflow="hidden">
      <VStack
        bg="solid.primary"
        color="green.400"
        w="100%"
        flexGrow="1"
        justify="center"
        fontSize="36px"
      >
        {icon}
      </VStack>
      <Text
        w="100%"
        lineHeight="16px"
        fontSize="10px"
        fontWeight="700"
        py={1}
        px={2.5}
        letterSpacing="0.08em"
        bgColor="#262A27"
        color="green.800"
        textAlign="center"
      >
        {amount} {name}
      </Text>
    </VStack>
  );
};
