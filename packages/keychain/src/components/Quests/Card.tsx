import { CircleCheckIcon, SparklesIcon } from "@cartridge/ui";
import { HStack, Spacer, Text } from "@chakra-ui/react";
import { QuestState } from "./types";

export function QuestCard({
  name,
  state,
}: {
  name: string;
  state: QuestState;
}) {
  let bgColor = "solid.primary";
  let color = "white";
  let check = false;
  let border = undefined;

  switch (state) {
    case QuestState.Claimable:
      bgColor = "solid.secondary";
      color = "green.400";
      check = true;
      break;
    case QuestState.Complete:
      bgColor = "transparent";
      color = "text.secondary";
      check = true;
      border = {
        border: "1px solid",
        borderColor: "solid.primary",
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
      {check && <CircleCheckIcon fontSize="lg" />}
      <Text color="currentColor">{name}</Text>
      <Spacer />
      {state !== QuestState.Complete && (
        <SparklesIcon variant="line" fontSize="lg" />
      )}
      {state === QuestState.Complete && (
        <Text fontSize="2xs" textTransform="uppercase" color="currentColor">
          Completed
        </Text>
      )}
    </HStack>
  );
}
