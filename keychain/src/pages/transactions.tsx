import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Flex, Container, Box, Text, Divider, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import Controller from "utils/controller";
import { useUrlTxns } from "hooks/transaction";
import TimerIcon from "@cartridge/ui/src/components/icons/Timer";

import { Header } from "components/Header";
import { Banner } from "components/Banner";
import Footer from "components/Footer";
import { Transaction, TransactionState } from "components/Transaction";
import { constants } from "starknet";
import Starknet from "@cartridge/ui/components/icons/Starknet";
import { FungibleTransfer, Mint, NonFungibleTransfer, useTransactionsQuery } from "generated/graphql";

const Transactions: NextPage = () => {
  const [txnResults, setTxnResults] = useState<TransactionState[]>([]);

  const controller = useMemo(() => Controller.fromStore(), []);
  const { chainId, txns } = useUrlTxns();

  const { data, error } = useTransactionsQuery({
    contractId: `starknet:${chainId === constants.StarknetChainId.MAINNET ? "SN_MAIN" : "SN_GOERLI"}:${controller.address}`,
  });

  const transactions: {[key: string]: ((typeof data)["transactions"]["edges"][0]["node"])[]} = useMemo(() => {
    if (!data) return [];

    let dates = {};
    data.transactions.edges.forEach(edge => {
      dates[edge.node.block.timestamp] = [...(dates[edge.node.block.timestamp] || []), edge.node];
    })
    return dates;
  }, [data])

  return (
    <>
      <Header address={controller.address} />
      <Container w={["full", "full", "400px"]} centerContent>
        <Flex w="full" m={4} flexDirection="column" gap="18px">
          <Banner
            title={"Transactions"}
            chainId={chainId}
            icon={<TimerIcon boxSize="30px" />}
          />
        </Flex>
        <Divider borderColor="gray.800" w="full" />
        <VStack mt="24px" w="full" align="start" spacing="18px">
        {txns.length > 0 && (
            <VStack w="full" align="start" spacing="12px"> 
              <Text fontSize="12px" color="gray.200" variant="ibm-upper-bold">
                Pending...
              </Text>
              {txns.map((txn, i) => <Transaction key={i} chainId={chainId} name={txn.name} hash={txn.hash}/>)}
            </VStack>
          )}
          {Object.keys(transactions).map((date, i) => (
            <VStack key={i} w="full" align="start" spacing="12px">
              <Text fontSize="12px" color="gray.200" variant="ibm-upper-bold">
                {new Date(date).toLocaleDateString()}
              </Text>
              {transactions[date].map((txn, i) => {
                const x = txn.metadata.__typename
                const names = {
                  "AccountUpgrade": "Account Upgrade",
                  "ContractDeploy": "Deploy",
                  "FungibleTransfer": (() => {
                    const metadata = txn.metadata as FungibleTransfer;
                    return `${metadata.from === controller.address ? "Send" : "Receive"} ${metadata.amount}`;
                  })(),
                  "NonFungibleTransfer": (() => {
                    const metadata = txn.metadata as NonFungibleTransfer;
                    return `${metadata.from === controller.address ? "Send" : "Receive"} ${metadata.amount} #${metadata.tokenId}`;
                  })(),
                  "Mint": (() => {
                    const metadata = txn.metadata as Mint;
                    return `Mint ${metadata.amount} #${metadata.tokenId}`;
                  })()
                }

                return <Transaction key={i} chainId={chainId} name={names[txn.metadata.__typename]} hash={txn.transactionHash}/>;
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
