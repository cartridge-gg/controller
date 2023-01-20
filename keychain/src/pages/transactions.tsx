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
import { useControllerModal } from "hooks/modal";
import { constants } from "starknet";
import Starknet from "@cartridge/ui/components/icons/Starknet";

const Transactions: NextPage = () => {
  const [txnResults, setTxnResults] = useState<TransactionState[]>([]);

  const controller = useMemo(() => Controller.fromStore(), []);
  const { chainId, txns } = useUrlTxns();

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
        {txns.length > -1 && (
            <VStack w="full" align="start" spacing="12px"> 
              <Text fontSize="12px" color="gray.200" variant="ibm-upper-bold">
                Pending...
              </Text>
              {txns.map((txn, i) => <Transaction key={i} chainId={chainId} name={txn.name} hash={txn.hash}/>)}
              <Transaction chainId={chainId} name="meow" hash="0x0"/>
            </VStack>
          )}
        </VStack>
        <Footer showConfirm={false} cancelText="Close" onCancel={cancel} />
      </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(Transactions), { ssr: false });
