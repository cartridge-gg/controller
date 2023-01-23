import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, VStack } from "@chakra-ui/react";

import Controller, { RegisterData, VERSION } from "utils/controller";
import {
  Abi,
  constants,
  hash,
  number,
  transaction,
  Call as StarknetCall,
  EstimateFee,
  EstimateFeeResponse,
  stark,
  InvocationsDetails,
} from "starknet";
import { Banner } from "components/Banner";
import { Call } from "components/Call";
import Footer from "components/Footer";
import { Error } from "components/Error";
import { estimateFeeBulk } from "utils/gateway";
import Fees from "components/Fees";
import TransactionIcon from "./icons/Transaction";
import BN from "bn.js";
import selectors from "utils/selectors";
import Storage from "utils/storage";
import {
  Error as ErrorReply,
  ExecuteReply,
  ResponseCodes,
} from "@cartridge/controller";
import { motion } from "framer-motion";
import Content from "./Content";

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
  const [nonce, setNonce] = useState<BN>();
  const [fees, setFees] = useState<{
    base: BN;
    max: BN;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);

  const account = controller.account(chainId);
  const { calls, calldata } = useMemo(() => {
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    return {
      calls,
      calldata: transaction.fromCallsToExecuteCalldata(calls),
    };
  }, [transactions]);

  // Estimate fees
  useEffect(() => {
    if (!controller || !nonce || !calls) {
      return;
    }

    if (account.registered && transactionsDetail.maxFee) {
      setFees({
        base: number.toBN(transactionsDetail.maxFee),
        max: number.toBN(transactionsDetail.maxFee),
      });
      return;
    }

    if (account.registered) {
      account
        .estimateInvokeFee(calls, { nonce })
        .then((fees) => {
          setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
        })
        .catch((e) => setError(e));
      return;
    }

    async function estimate() {
      const pendingRegister = Storage.get(
        selectors[VERSION].register(controller.address, chainId),
      );
      try {
        const nextNonce = number.toHex(nonce.add(number.toBN(1)));
        const signerDetails = {
          walletAddress: controller.address,
          nonce: nextNonce,
          maxFee: constants.ZERO,
          version: hash.transactionVersion,
          chainId: chainId,
        };

        const signature = await controller.signer.signTransaction(
          calls,
          signerDetails,
        );

        let estimates = await estimateFeeBulk(chainId, [
          pendingRegister.invoke,
          {
            invocation: {
              contractAddress: controller.address,
              calldata: calldata,
              signature,
            },
            details: {
              version: hash.transactionVersion,
              nonce: nextNonce,
              maxFee: constants.ZERO,
            },
          },
        ]);

        if (estimates.code) {
          setError(estimates.message);
          return;
        }

        const estimates2 = estimates as EstimateFeeResponse[];
        const fees = estimates2.reduce<EstimateFee>(
          (prev, estimate) => {
            const overall_fee = prev.overall_fee.add(
              number.toBN(estimate.overall_fee),
            );
            return {
              overall_fee: overall_fee,
              gas_consumed: prev.gas_consumed.add(
                number.toBN(estimate.gas_consumed),
              ),
              gas_price: prev.gas_price.add(number.toBN(estimate.gas_price)),
              suggestedMaxFee: overall_fee,
            };
          },
          {
            overall_fee: number.toBN(0),
            gas_consumed: number.toBN(0),
            gas_price: number.toBN(0),
            suggestedMaxFee: number.toBN(0),
          },
        );

        fees.suggestedMaxFee = stark.estimatedFeeToMaxFee(fees.overall_fee);
        setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
      } catch (e) {
        //debugger;
        console.error(e);
        setError(e);
        return;
      }
    }

    estimate();
  }, [
    account,
    controller,
    nonce,
    setError,
    setFees,
    calldata,
    calls,
    chainId,
    transactionsDetail.maxFee,
  ]);

  useEffect(() => {
    account.getNonce().then((n: BN) => {
      setNonce(number.toBN(n));
    });
  }, [account]);

  const onSubmit = useCallback(async () => {
    setLoading(true);

    if (!account.registered) {
      const pendingRegister = Storage.get(
        selectors[VERSION].register(controller.address, chainId),
      ) as RegisterData;

      const responses = await Promise.all([
        controller
          .account(chainId)
          .invokeFunction(pendingRegister.invoke.invocation, {
            ...pendingRegister.invoke.details,
            nonce: pendingRegister.invoke.details.nonce!,
          }),
        controller.account(chainId).execute(calls, null, {
          maxFee: fees.max,
          nonce: nonce.add(number.toBN(1)),
          version: hash.transactionVersion,
        }),
      ]);
      Storage.remove(selectors[VERSION].register(controller.address, chainId));
      onExecute({
        transaction_hash: responses[1].transaction_hash,
        code: ResponseCodes.SUCCESS,
      });
      return;
    }

    const response = await account.execute(calls, null, {
      maxFee: fees.max,
      nonce,
      version: hash.transactionVersion,
    });
    onExecute({
      transaction_hash: response.transaction_hash,
      code: ResponseCodes.SUCCESS,
    });
  }, [account, chainId, controller, nonce, calls, fees, onExecute]);

  return (
    <Content>
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
        <VStack w="full">
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
    </Content>
  );
};

export default Execute;
