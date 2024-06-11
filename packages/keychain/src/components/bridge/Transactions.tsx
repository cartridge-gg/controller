import { Circle, HStack, Link, Spacer, Text, VStack } from "@chakra-ui/react";
import { Label } from "./Label";
import { Loading } from "components/Loading";
import { useEffect, useState } from "react";
import { constants } from "starknet";
import { mainnet, useWaitForTransaction } from "wagmi";
import { sepolia } from "wagmi/chains";
import { CheckIcon, ExternalIcon, TransferDuoIcon } from "@cartridge/ui";
import { Banner } from "components/layout";

enum CardState {
  PENDING = "PENDING",
  COMPLETE = "COMPLETE",
}

export function TxnTracker({
  chainId,
  ethTxnHash,
}: {
  chainId: constants.StarknetChainId;
  ethTxnHash: string;
}) {
  const [txn, setTxn] = useState<{ hash: string; state: CardState }>({
    hash: ethTxnHash,
    state: CardState.PENDING,
  });
  const etherscanSubdomain =
    chainId === constants.StarknetChainId.SN_MAIN ? "" : "sepolia.";
  const etherscanHref = `https://${etherscanSubdomain}etherscan.io/tx/${ethTxnHash}`;

  return (
    <VStack w="full" align="start" spacing={6}>
      <Banner Icon={TransferDuoIcon} title="Transactions" />

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
              fontSize="xs"
              letterSpacing="0.05em"
              fontWeight="bold"
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
              fontSize="xs"
              letterSpacing="0.05em"
              fontWeight="bold"
              textTransform="uppercase"
              color="brand.accent" // not meant for text color
            >
              Eth arriving on L2
            </Text>
          </Card>
        </>
      )}
    </VStack>
  );
}

function Card({
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
}) {
  const { data } = useWaitForTransaction({
    chainId:
      chainId === constants.StarknetChainId.SN_MAIN ? mainnet.id : sepolia.id,
    hash: ethTxnHash as `0x${string}`,
    enabled: state === CardState.PENDING,
  });

  useEffect(() => {
    if (data !== undefined) onConfirmed?.();
  }, [data, onConfirmed]);

  return (
    <HStack
      w="full"
      minH="54px"
      bg="solid.primary"
      borderRadius="sm"
      p={4}
      spacing={4}
    >
      <Circle bg="solid.secondary" size={12}>
        {state === CardState.PENDING ? (
          <Loading fill="text.primary" />
        ) : (
          <CheckIcon boxSize={6} color="brand.accent" />
        )}
      </Circle>

      {children}

      <Spacer />

      <Link href={href} isExternal>
        <HStack px={3} h="full">
          <ExternalIcon color="link.blue" boxSize={4} />
        </HStack>
      </Link>
    </HStack>
  );
}
