import {
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { QuestState } from "pages/quests";
import { useEffect, useState } from "react";
import MapIcon from "@cartridge/ui/components/icons/Map";
import Check from "components/icons/Check";
import CircleCheck from "components/icons/CircleCheck";
import CircleIcon from "components/icons/Circle";
import SparkleOutline from "@cartridge/ui/components/icons/SparkleOutline";
import { useClaimQuestRewardsMutation } from "generated/graphql";

const Tag = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      bgColor="legacy.whiteAlpha.100"
      color="currentColor"
      p="6px 12px"
      fontFamily="LD_Mono"
      textTransform="uppercase"
      fontSize="10px"
      fontWeight="700"
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
        bgColor="legacy.gray.400"
        color="legacy.green.400"
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
        p="4px 10px"
        letterSpacing="0.08em"
        bgColor="#262A27"
        color="legacy.green.800"
        textAlign="center"
      >
        {amount} {name}
      </Text>
    </VStack>
  );
};

const QuestDetails = ({
  questsWithProgress,
  selectedId,
  address,
  onClaim,
}: {
  questsWithProgress: Array<{ quest: any; progress: any }>;
  selectedId: string;
  address: string;
  onClaim: () => void;
}) => {
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
            borderColor="legacy.gray.700"
            userSelect="none"
          >
            <HStack w="full" spacing="18px">
              <Circle bgColor="legacy.gray.700" size="48px">
                <MapIcon w="30px" h="30px" />
              </Circle>
              <Text as="h1" fontWeight="600" fontSize="17px">
                {quest?.node?.title}
              </Text>
            </HStack>
            <HStack
              my="24px"
              color={
                typeof questState === "undefined" ||
                questState === QuestState.Incomplete
                  ? "legacy.whiteAlpha.800"
                  : "legacy.green.400"
              }
            >
              <Tag>
                {typeof questState !== "undefined" ||
                  (questState !== QuestState.Incomplete && <Check mr="6px" />)}
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
            bgColor="legacy.whiteAlpha.50"
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
                      <CircleCheck color="legacy.green.400" />
                    ) : (
                      <CircleIcon color="legacy.gray.200" />
                    )}
                    <Text
                      fontSize="12px"
                      color={
                        eventProgress?.completed
                          ? "legacy.green.400"
                          : "legacy.gray.200"
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
                icon={<SparkleOutline />}
                amount={quest.points}
                name="XP"
              />
            )}
          </Flex>
        </Flex>
      </Box>
      <Box
        w="full"
        h="65px"
        borderTop="1px solid"
        borderColor="legacy.gray.700"
      >
        <Button
          w="full"
          mt="24px"
          disabled={questState !== QuestState.Claimable || !address}
          onClick={() => {
            mutateAsync({
              accountId: `starknet:SN_GOERLI:${address}`,
              questId: selectedId,
            })
              .then(() => {
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
};

export default QuestDetails;
