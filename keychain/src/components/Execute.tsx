import { useCallback, useEffect, useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";

import Controller, { RegisterData } from "utils/controller";
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
import { normalize, validate } from "pages";
import { estimateFeeBulk } from "utils/gateway";
import Fees from "components/Fees";
import JoystickIcon from "@cartridge/ui/src/components/icons/Joystick";
import BN from "bn.js";

const Execute = ({
  origin,
  controller,
  transactions,
  transactionsDetail,
  abis,
}: {
  origin: string;
  controller: Controller;
  transactions: StarknetCall | StarknetCall[];
  transactionsDetail?: InvocationsDetails & {
    chainId?: constants.StarknetChainId;
  };
  abis?: Abi[];
}) => {
  const [registerData, setRegisterData] = useState<RegisterData>();
  const [nonce, setNonce] = useState<BN>();
  const [fees, setFees] = useState<{
    base: BN;
    max: BN;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);

  const chainId = useMemo(
    () =>
      transactionsDetail
        ? transactionsDetail.chainId
        : constants.StarknetChainId.MAINNET,
    [transactionsDetail],
  );
  const account = useMemo(
    () => controller.account(chainId),
    [controller, chainId],
  );
  const { calls, calldata } = useMemo(() => {
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    return {
      calls,
      calldata: transaction.fromCallsToExecuteCalldata(calls),
    };
  }, [transactions]);

  const execute = useCallback(
    (calls: StarknetCall[]) => {
      return normalize(
        validate((controller) => {
          return async () => {
            if (account.registered) {
              return await account.execute(calls, null, {
                maxFee: fees.max,
                nonce,
                version: hash.transactionVersion,
              });
            }

            return await Promise.all([
              account.invokeFunction(registerData.invoke.invocation, {
                ...registerData.invoke.details,
                nonce: registerData.invoke.details.nonce!,
              }),
              account.execute(calls, null, {
                maxFee: fees.max,
                nonce: nonce.add(number.toBN(1)),
                version: hash.transactionVersion,
              }),
            ]);
          };
        }),
      );
    },
    [account, fees, nonce, registerData],
  );

  // Estimate fees
  useEffect(() => {
    if (!controller || !nonce || !calls) {
      return;
    }

    async function register() {
      if (account.registered) {
        if (transactionsDetail.maxFee) {
          setFees({
            base: number.toBN(transactionsDetail.maxFee),
            max: number.toBN(transactionsDetail.maxFee),
          });
          return;
        }
        const fees = await account.estimateInvokeFee(calls, { nonce });
        setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
      } else if (!account.registered && registerData) {
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

          const estimates = (await estimateFeeBulk(chainId, [
            registerData.invoke,
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
          ])) as EstimateFeeResponse[];

          const fees = estimates.reduce<EstimateFee>(
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
          console.error(e);
          setError(e);
          return;
        }
      }
    }

    register();
  }, [
    account,
    controller,
    nonce,
    registerData,
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
    await account.execute(calls, null, {
      maxFee: fees.max,
      nonce,
      version: hash.transactionVersion,
    });

    setLoading(false);
    confirm();
  }, [account, nonce, calls, fees.max]);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Flex m={4} flex={1} flexDirection="column">
      <Banner
        title="Execute Transactions"
        description={`${origin} is requesting to execute the following transactions`}
        icon={<JoystickIcon boxSize="30px" />}
        chainId={chainId}
        pb="20px"
      />
      <Flex my={2} flex={1} flexDirection="column" gap="10px">
        {calls.map((call, i) => (
          <Call
            key={i}
            chainId={chainId}
            policy={{
              target: call.contractAddress,
              method: call.entrypoint,
            }}
          />
        ))}
        <Footer
          isLoading={isLoading}
          isDisabled={!fees}
          onConfirm={onSubmit}
          onCancel={() => {}}
        >
          <Fees chainId={chainId} fees={fees} />
        </Footer>
      </Flex>
    </Flex>
  );
};

export default Execute;
