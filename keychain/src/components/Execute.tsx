import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, VStack } from "@chakra-ui/react";

import Controller from "utils/controller";
import {
  Abi,
  constants,
  number,
  Call as StarknetCall,
  InvocationsDetails,
} from "starknet";
import { Banner } from "components/Banner";
import { Call } from "components/Call";
import Footer from "components/Footer";
import { Error } from "components/Error";
import Fees from "components/Fees";
import TransactionIcon from "./icons/Transaction";
import BN from "bn.js";
import {
  Error as ErrorReply,
  ExecuteReply,
  ResponseCodes,
} from "@cartridge/controller";
import Container from "./Container";
import { Status } from "utils/account";
import { Header } from "./Header";

const Execute = ({
  origin,
  chainId,
  controller,
  transactions,
  transactionsDetail,
  abis,
  onExecute,
  onCancel,
}: {
  origin: string;
  chainId: constants.StarknetChainId;
  controller: Controller;
  transactions: StarknetCall | StarknetCall[];
  transactionsDetail?: InvocationsDetails;
  abis?: Abi[];
  onExecute: (res: ExecuteReply) => void;
  onCancel: (error: ErrorReply) => void;
}) => {
  const [fees, setFees] = useState<{
    base: BN;
    max: BN;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);

  const account = controller.account(chainId);
  const calls = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [transactions];
  }, [transactions]);

  // Estimate fees
  useEffect(() => {
    if (!controller || !calls) {
      return;
    }

    if (account.status === Status.REGISTERED && transactionsDetail.maxFee) {
      setFees({
        base: number.toBN(transactionsDetail.maxFee),
        max: number.toBN(transactionsDetail.maxFee),
      });
      return;
    }

    account
      .estimateInvokeFee(calls, transactionsDetail)
      .then((fees) => {
        setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
      })
      .catch((e) => setError(e));
  }, [
    account,
    controller,
    setError,
    setFees,
    calls,
    chainId,
    transactionsDetail,
  ]);

  const onSubmit = useCallback(async () => {
    setLoading(true);
    const response = await account.execute(calls, null, {
      maxFee: fees.max,
    });
    onExecute({
      transaction_hash: response.transaction_hash,
      code: ResponseCodes.SUCCESS,
    });
  }, [account, calls, fees, onExecute]);

  return (

    <Container>
      <Header />
      <Banner
        title="Submit Transaction"
        icon={<TransactionIcon boxSize="30px" />}
        chainId={chainId}
        pb="20px"
      />
      <VStack spacing="1px" w="full">
        <VStack
          w="full"
          p="12px"
          align="flex-start"
          bgColor="gray.700"
          borderRadius="6px 6px 0 0"
        >
          <Text variant="ibm-upper-bold" fontSize="10px" color="gray.200">
            Actions
          </Text>
          <Text fontSize="11px" color="gray.200">
            Execute the following actions
          </Text>
        </VStack>
        <VStack w="full" spacing="1px">
          {calls.map((call, i) => (
            <Call
              key={i}
              chainId={chainId}
              policy={{
                target: call.contractAddress,
                method: call.entrypoint,
              }}
              _last={{ borderRadius: "0 0 6px 6px" }}
            />
          ))}
        </VStack>
      </VStack>
      <Footer
        isLoading={isLoading}
        isDisabled={!fees}
        confirmText="Submit"
        onConfirm={onSubmit}
        onCancel={() => {
          onCancel({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          });
        }}
      >
        {!error && <Fees chainId={chainId} fees={fees} />}
        <Error error={error} />
      </Footer>
    </Container>
  );
};

export default Execute;
