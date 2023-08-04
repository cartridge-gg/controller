import { SparklesLineIcon } from "@cartridge/ui";
import { HStack, Spacer, Text } from "@chakra-ui/react";
import CircleCheck from "components/icons/CircleCheck";
import { QuestState } from "pages/quests";

const QuestCard = ({
  name,
  state,
  rewards,
}: {
  name: string;
  state: QuestState;
  rewards: Array<any>;
}) => {
  let bgColor = "gray.700";
  let color = "white";
  let check = false;
  let border = undefined;

  switch (state) {
    case QuestState.Claimable:
      bgColor = "gray.600";
      color = "green.400";
      check = true;
      break;
    case QuestState.Complete:
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
      {state !== QuestState.Complete && <SparklesLineIcon fontSize="18px" />}
      {state === QuestState.Complete && (
        <Text
          variant="ld-mono-upper"
          fontSize="10px"
          textTransform="uppercase"
          color="currentColor"
        >
          Completed
        </Text>
      )}
    </HStack>
  );
};

export default QuestCard;
