import {
  Text,
  VStack,
  HStack,
  Flex,
  Circle,
  Spacer,
  Button,
  Alert,
  AlertIcon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import CheckIcon from "@cartridge/ui/src/components/icons/Check";
import ArrowIcon from "@cartridge/ui/src/components/icons/Arrow";
import {
  useAccountQuestsQuery,
  useCheckDiscordQuestsMutation,
  useCheckTwitterQuestsMutation,
  useDeployAccountMutation,
  useStarterPackQuery,
} from "generated/graphql";
import { Loading } from "components/Loading";
import useSound from "use-sound";

interface QuestsProps {
  username: string;
  gameId: string;
  starterpackId: string;
}

export const Quests = ({ username, gameId, starterpackId }: QuestsProps) => {
  const isMobile = useBreakpointValue([true, false, false]);

  const [checkingQuests, setCheckingQuests] = useState(false);
  const [error, setError] = useState(null);

  const { data: questsData, refetch } = useAccountQuestsQuery({
    accountId: username,
  });

  const router = useRouter();
  const { redirect_uri } = router.query;

  const { data } = useStarterPackQuery({ id: gameId });

  const { mutateAsync: checkTwitterQuests } = useCheckTwitterQuestsMutation();
  const { mutateAsync: checkDiscordQuests } = useCheckDiscordQuestsMutation();

  const [playSound] = useSound(
    "https://static.cartridge.gg/sounds/startup.mp3",
  );

  const checkQuests = useCallback(() => {
    setCheckingQuests(true);
    Promise.all([
      checkTwitterQuests({
        accountId: username,
      }),
      checkDiscordQuests({
        accountId: username,
      }),
    ])
      .then(() => refetch())
      .then(() => setCheckingQuests(false));
  }, [checkDiscordQuests, checkTwitterQuests, refetch, username]);

  // check quests on window focus and refetch
  useEffect(() => {
    window.addEventListener("focus", checkQuests);
    return () => {
      window.removeEventListener("focus", checkQuests);
    };
  }, [username, checkQuests]);

  useEffect(() => {
    setError(
      router.query.attestation === "error"
        ? "An error occurred while trying to connect your third party account. A potential reason is that your account might already be connected to another cartridge controller."
        : null,
    );
  }, [router]);

  const requiredQuests = useMemo(
    () =>
      questsData?.quests.edges
        ?.filter((q) =>
          data?.game?.starterPack?.prerequisitesQuests?.find(
            (pq) => pq.id === q.node.id || pq.parent?.id === q.node.id,
          ),
        )
        .map((q) => ({
          ...q.node,
          isCompleted: questsData?.account?.questProgression?.edges.find(
            (aq) => q.node.id === aq.node.questID,
          )?.node.completed,
          parent: q.node.parent && {
            ...q.node.parent,
            isCompleted:
              questsData?.account?.questProgression?.edges.find(
                (aq) => q.node.parent?.id === aq.node.questID,
              )?.node.completed ?? false,
          },
        })),
    [data, questsData],
  );

  const { mutateAsync: deployAccount, isLoading } = useDeployAccountMutation();

  const onComplete = useCallback(async () => {
    playSound();
    deployAccount({
      id: username,
      chainId: "starknet:SN_MAIN",
      starterpackIds: [starterpackId],
    }).then((res) =>
      router.replace(
        redirect_uri
          ? `${redirect_uri}?hash=${res.deployAccount.deployTransaction.transactionHash}`
          : `/games/${gameId}`,
      ),
    );
  }, [
    deployAccount,
    playSound,
    gameId,
    router,
    username,
    starterpackId,
    redirect_uri,
  ]);

  return (
    <>
      <VStack align="start">
        {requiredQuests?.map((quest, index) => {
          const parentCompleted =
            index === 0 || requiredQuests[index - 1]?.isCompleted;
          const active = parentCompleted && !quest.isCompleted;
          return (
            <Flex
              key={quest.id}
              position="relative"
              align="center"
              w="full"
              borderRadius="4px"
              minH="60px"
              px="24px"
              py="8px"
              gap="8px"
              bg={quest.isCompleted ? "gray.700" : "gray.600"}
              opacity={parentCompleted ? 1 : 0.5}
              overflow="hidden"
              color={quest.isCompleted ? "green.400" : "white"}
              pointerEvents={active ? "auto" : "none"}
              _before={
                active && {
                  content: '""',
                  position: "absolute",
                  left: "0px",
                  top: "0px",
                  w: "8px",
                  h: "100%",
                  backgroundColor: "gray.500",
                }
              }
            >
              <HStack gap="5px">
                {quest.isCompleted ? (
                  <CheckIcon w="12px" h="12px" />
                ) : (
                  <Circle
                    size="16px"
                    color="gray.700"
                    bg="white"
                    pl="1px"
                    fontSize="9px"
                    fontWeight="bold"
                  >
                    {index + 1}
                  </Circle>
                )}
                <Text
                  color="currentcolor"
                  fontFamily="LD_Mono"
                  fontSize="12px"
                  fontWeight={700}
                  letterSpacing="0.1em"
                >
                  {quest.title}
                </Text>
              </HStack>
              <Spacer />
              <Button
                as="a"
                href={(() => {
                  if (quest.metadata?.callToAction?.url) {
                    const metadataUrl = new URL(
                      quest.metadata.callToAction?.url,
                    );
                    metadataUrl.searchParams.set(
                      "state",
                      encodeURIComponent(
                        JSON.stringify({
                          account_id: username,
                          redirect_uri: !isMobile
                            ? window.location.href
                            : "https://cartridge.gg/connection",
                        }),
                      ),
                    );

                    return metadataUrl.toString();
                  }

                  return "";
                })()}
                target={
                  quest.metadata?.callToAction?.redirect && !isMobile
                    ? "_self"
                    : "_blank"
                }
                variant="accent"
                _hover={{}}
                hidden={quest.isCompleted}
                _disabled={{ color: "white" }}
                isDisabled={!active}
              >
                {quest.metadata.callToAction.text}
              </Button>
            </Flex>
          );
        })}
      </VStack>
      {error && (
        <Alert bg="transparent" status="error" mt="8px">
          <AlertIcon w="18px" color="red.400" />
          <Text fontSize="14px" color="red.400">
            {error}
          </Text>
        </Alert>
      )}
      <VStack mt="24px">
        <Button
          w="full"
          variant="accent"
          hidden={requiredQuests?.every((q) => q.isCompleted)}
          onClick={checkQuests}
          disabled={checkingQuests}
        >
          {checkingQuests ? <Loading fill="currentcolor" /> : "Verify Quests"}
        </Button>
        <Button
          gap="8px"
          w="full"
          onClick={onComplete}
          disabled={isLoading || !requiredQuests?.every((q) => q.isCompleted)}
        >
          {isLoading ? (
            <Loading />
          ) : (
            <>
              Complete <ArrowIcon />
            </>
          )}
        </Button>
      </VStack>
    </>
  );
};
