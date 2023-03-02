import LinkIcon from "@cartridge/ui/components/icons/Link";
import { Circle, HStack, Link, Spacer, Text, VStack } from "@chakra-ui/react";
import Check from "components/icons/Check";
import Transfer from "components/icons/Transfer";
import Label from "components/Label";
import { Loading } from "components/Loading";
import { useEffect, useState } from "react";
import { constants } from "starknet";
import { goerli, mainnet, useWaitForTransaction } from "wagmi";

enum CardState {
  PENDING = "PENDING",
  COMPLETE = "COMPLETE",
};

const Card = ({
  state,
  href,
  chainId,
  ethTxnHash,
  onConfirmed,
  children,
}: {
  state: CardState;
  href: string;
  chainId: constants.StarknetChainId;
  ethTxnHash: string;
  onConfirmed?: () => void;
  children: React.ReactNode;
}) => {
  const { data } = useWaitForTransaction({
    chainId: chainId === constants.StarknetChainId.MAINNET ? mainnet.id : goerli.id,
    hash: ethTxnHash as `0x${string}`,
    enabled: state === CardState.PENDING,
  });

  useEffect(() => {
    if (data !== undefined)
      onConfirmed?.();
  }, [data, onConfirmed])

  return (
    <HStack
      w="full"
      minH="54px"
      bgColor="gray.700"
      borderRadius="4px"
      p="12px"
      spacing="12px"
    >
      <Circle bgColor="gray.600" size="30px">
        {state === CardState.PENDING
          ? (<Loading width="12px" height="12px" fill="white" />)
          : (<Check boxSize="18px" fill="green.400" />)
        }
      </Circle>
      {children}
      <Spacer />
      <Link
        href={href}
        isExternal
      >
        <HStack px="13px" h="full">
          <LinkIcon color="blue.400" boxSize="12px" />
        </HStack>
      </Link>
    </HStack>
  );
}

const TxnTracker = ({
  address,
  chainId,
  ethTxnHash,
}: {
  address: string;
  chainId: constants.StarknetChainId;
  ethTxnHash: string;
}) => {
  const [txn, setTxn] = useState<{ hash: string, state: CardState }>({
    hash: ethTxnHash,
    state: CardState.PENDING,
  });
  const etherscanSubdomain = chainId === constants.StarknetChainId.MAINNET ? "" : "goerli.";
  const etherscanHref = (
    `https://${etherscanSubdomain}etherscan.io/tx/${ethTxnHash}`
  );

  return (
    <VStack w="full" align="start" spacing="24px">
      <HStack
        w="full"
        minH="72px"
        borderBottom="1px solid"
        borderColor="gray.700"
        justify="flex-start"
        pb="20px"
        spacing="20px"
      >
        <Circle bgColor="gray.700" size="48px">
          <Transfer boxSize="30px" color="green.400" />
        </Circle>
        <Text fontSize="17px" fontWeight="bold">
          Transactions
        </Text>
      </HStack>
      {txn.state === CardState.PENDING && (
        <>
          <Label>Pending...</Label>
          <Card
            state={CardState.PENDING}
            href={etherscanHref}
            chainId={chainId}
            ethTxnHash={ethTxnHash}
            onConfirmed={() => {
              setTxn({
                hash: txn.hash,
                state: CardState.COMPLETE,
              });
            }}
          >
            <Text
              fontSize="11px"
              letterSpacing="0.05em"
              fontWeight="700"
              textTransform="uppercase"
            >
              Eth leaving L1
            </Text>
          </Card>
        </>
      )}
      {txn.state === CardState.COMPLETE && (
        <>
          <Label>Today</Label>
          <Card
            state={CardState.COMPLETE}
            href={etherscanHref}
            chainId={chainId}
            ethTxnHash={ethTxnHash}
          >
            <Text
              fontSize="11px"
              letterSpacing="0.05em"
              fontWeight="700"
              textTransform="uppercase"
              color="green.400"
            >
              Eth arriving on L2
            </Text>
          </Card>
        </>
      )}
    </VStack>
  );
}

export default TxnTracker;
