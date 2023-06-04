import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Flex, Text, Link, VStack, Button } from "@chakra-ui/react";
import { Loading } from "components/Loading";
import { defaultProvider } from "starknet";
import ArrowIcon from "@cartridge/ui/src/components/icons/Arrow";
import CheckIcon from "@cartridge/ui/src/components/icons/Check";
import useSound from "use-sound";
export interface PendingProps {
  transaction: string;
  name: string;
  gameId: string;
}

export const PendingTxn = ({ transaction, name, gameId }: PendingProps) => {
  const router = useRouter();
  const { redirect_uri } = router.query;
  const [pending, setPending] = useState<boolean>(true);
  const [play] = useSound("https://static.cartridge.gg/sounds/startup.mp3");

  useEffect(() => {
    play();
    defaultProvider
      .waitForTransaction(transaction)
      .then(() => setPending(true))
      .catch((e) => {
        console.error(e);
      });
  }, [transaction, play]);
  return (
    <>
      <Flex
        py="20px"
        bgColor="legacy.gray.700"
        direction="column"
        borderRadius="8px"
        align="center"
        justify="center"
      >
        <Box py="20px">
          {pending ? (
            <Loading fill="white" height="26px" width="26px" />
          ) : (
            <CheckIcon boxSize="26px" />
          )}
        </Box>
        <VStack spacing="10px">
          <Text variant="ibm-upper-bold" fontSize="11px">
            Transaction {pending ? "Pending..." : "Complete!"}
          </Text>
          <Text fontSize="12px" color="legacy.gray.200">
            {pending ? "This may take a few minutes" : "You're ready to go!"}
          </Text>
          <Link
            href={`https://starkscan.co/tx/${transaction}`}
            variant="traditional"
            fontSize="12px"
            isExternal
          >
            View on Starkscan
          </Link>
        </VStack>
      </Flex>
      <Box h="1px" w="full" my="20px" bgColor="legacy.whiteAlpha.300" />
      <Button
        w="full"
        gap="5px"
        onClick={() => {
          router.replace(
            redirect_uri
              ? `${redirect_uri}?hash=${transaction}`
              : `/games/${gameId}`,
          );
        }}
      >
        {redirect_uri && "Return to"} {name} <ArrowIcon />{" "}
      </Button>
    </>
  );
};
