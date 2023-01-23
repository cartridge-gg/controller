import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Flex, Container, Box, Text, Divider, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import Controller from "utils/controller";
import TimerIcon from "@cartridge/ui/src/components/icons/Timer";
import { Header } from "components/Header";
import { Banner } from "components/Banner";
import Footer from "components/Footer";
import { Transaction, TransactionState } from "components/Transaction";
import { constants } from "starknet";
import Starknet from "@cartridge/ui/components/icons/Starknet";
import {
  FungibleTransfer,
  Mint,
  NonFungibleTransfer,
  useTransactionsQuery,
} from "generated/graphql";
import { usePendingTransactions } from "hooks/pending";
import { useRouter } from "next/router";

const Transactions: NextPage = () => {
  const router = useRouter();
  const chainId = router.query.chainId ?? "SN_GOERLI";

  const controller = useMemo(() => Controller.fromStore(), []);
  const { pendingTransactions, finalizedTransactions, add } =
    usePendingTransactions();

  const { data, error } = useTransactionsQuery({
    contractId: `starknet:${chainId}:${controller.address}`,
  });

  const transactions: {
    [key: string]: typeof data["transactions"]["edges"][0]["node"][];
  } = useMemo(() => {
    if (!data) return [];

    let txns = {};
    data.transactions.edges.forEach((edge) => {
      if (!txns[edge.node.block.timestamp])
        txns[edge.node.block.timestamp] = {};
      txns[edge.node.block.timestamp][edge.node.transactionHash] = edge.node;
    });
    return txns;
  }, [data]);

  return (
    <>
      <Header address={controller.address} />
      <Container w={["full", "full", "400px"]} centerContent>
        <Flex w="full" m={4} flexDirection="column" gap="18px">
          <Banner
            title={"Transactions"}
            chainId={
              chainId === "SN_MAIN"
                ? constants.StarknetChainId.MAINNET
                : constants.StarknetChainId.TESTNET
            }
            icon={<TimerIcon boxSize="30px" />}
          />
        </Flex>
        <Divider borderColor="gray.800" w="full" />
        <VStack mt="24px" w="full" align="start" spacing="18px">
          {pendingTransactions.length > 0 && (
            <VStack w="full" align="start" spacing="12px">
              <Text fontSize="12px" color="gray.200" variant="ibm-upper-bold">
                Pending...
              </Text>
              {pendingTransactions.map((txn, i) => (
                <Transaction
                  key={i}
                  chainId={txn.chainId}
                  name={txn.label}
                  hash={txn.hash}
                />
              ))}
            </VStack>
          )}
          {finalizedTransactions.length > 0 && (
            <VStack w="full" align="start" spacing="12px">
              <Text fontSize="12px" color="gray.200" variant="ibm-upper-bold">
                Finalized
              </Text>
              {finalizedTransactions.map((txn, i) => (
                <Transaction
                  key={i}
                  chainId={txn.chainId}
                  name={txn.label}
                  hash={txn.hash}
                  initialState={txn.state}
                />
              ))}
            </VStack>
          )}
          {Object.keys(transactions).map((date, i) => (
            <VStack key={i} w="full" align="start" spacing="12px">
              <Text fontSize="12px" color="gray.200" variant="ibm-upper-bold">
                {new Date(date).toLocaleDateString()}
              </Text>
              {Object.keys(transactions[date]).map((txn: any, i) => {
                txn = transactions[date][txn];
                const names = {
                  AccountUpgrade: "Account Upgrade",
                  ContractDeploy: "Deploy",
                  FungibleTransfer: (() => {
                    const metadata = txn.metadata as FungibleTransfer;
                    return `${
                      metadata.from === controller.address ? "Send" : "Receive"
                    } ${metadata.amount}`;
                  })(),
                  NonFungibleTransfer: (() => {
                    const metadata = txn.metadata as NonFungibleTransfer;
                    return `${
                      metadata.from === controller.address ? "Send" : "Receive"
                    } ${metadata.amount} #${metadata.tokenId}`;
                  })(),
                  Mint: (() => {
                    const metadata = txn.metadata as Mint;
                    return `Mint ${metadata.amount} #${metadata.tokenId}`;
                  })(),
                };

                return (
                  <Transaction
                    key={i}
                    chainId={
                      chainId === "SN_MAIN"
                        ? constants.StarknetChainId.MAINNET
                        : constants.StarknetChainId.TESTNET
                    }
                    name={names[txn.metadata.__typename]}
                    hash={txn.transactionHash}
                    initialState="success"
                  />
                );
              })}
            </VStack>
          ))}
        </VStack>
        <Footer showConfirm={false} cancelText="Close" />
      </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(Transactions), { ssr: false });
