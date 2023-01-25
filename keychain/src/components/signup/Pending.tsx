import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  Text,
  Link,
  VStack,
  Button,
  Circle,
} from "@chakra-ui/react";
import { Error as ErrorReply, ResponseCodes } from "@cartridge/controller";
import { Loading } from "components/Loading";
import { constants, defaultProvider } from "starknet";
import ArrowIcon from "@cartridge/ui/src/components/icons/Arrow";
import CheckIcon from "@cartridge/ui/src/components/icons/Check";
import useSound from "use-sound";
import Container from "components/Container";
import { Header } from "components/Header";
import { Banner } from "components/Banner";
import Footer from "components/Footer";
import SparkleColored from "@cartridge/ui/src/components/icons/SparkleColored";
import Controller from "utils/controller";

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
        bgColor="gray.700"
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
          <Text fontSize="12px" color="gray.200">
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
      <Box h="1px" w="full" my="20px" bgColor="whiteAlpha.300" />
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

export const DeployingController = ({
  chainId,
  controller,
  onClose,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onClose: (error: ErrorReply) => void;
}) => {
  const close = () => {
    onClose({
      code: ResponseCodes.CANCELED,
      message: "Canceled",
    });
  };

  const account = controller.account(chainId);
  return (
    <Container>
      <Header onClose={close} />
      <Banner
        icon={<SparkleColored boxSize="30px" />}
        title="Deploying your account"
        description="This may take a second, try again in a bit"
      />
      <Footer showConfirm={false} cancelText="Close" onCancel={close} />
    </Container>
  );
};
