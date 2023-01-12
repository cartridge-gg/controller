import { useCallback, useEffect, useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";

import { Header } from "components/Header";
import Controller, { RegisterData, VERSION } from "utils/controller";
import {
  constants,
  hash,
  number,
  transaction,
  Call as StarknetCall,
  EstimateFee,
  EstimateFeeResponse,
  stark,
} from "starknet";
import Storage from "utils/storage";
import { Banner } from "components/Banner";
import { Call } from "components/Call";
import Footer from "components/Footer";
import { normalize, validate } from "pages";
import { estimateFeeBulk } from "utils/gateway";
import selectors from "utils/selectors";
import Register from "components/Register";
import Fees from "components/Fees";
import JoystickIcon from "@cartridge/ui/src/components/icons/Joystick";
import BN from "bn.js";

const Execute = ({
  url,
  calls,
  chainId,
  maxFee,
}: {
  url: URL;
  calls: StarknetCall[];
  chainId?: constants.StarknetChainId;
  maxFee?: string;
}) => {
  const [registerData, setRegisterData] = useState<RegisterData>();
  const [nonce, setNonce] = useState<BN>();
  const [fees, setFees] = useState<{
    base: BN;
    max: BN;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const controller = useMemo(() => Controller.fromStore(), []);

  const calldata = useMemo(
    () => transaction.fromCallsToExecuteCalldata(calls),
    [calls],
  );

  const execute = useCallback(
    (calls: StarknetCall[]) => {
      const account = controller.account(chainId);
      return normalize(
        validate((controller) => {
          return async () => {
            if (account.registered) {
              return await controller.account(chainId).execute(calls, null, {
                maxFee: fees.max,
                nonce,
                version: hash.transactionVersion,
              });
            }

            return await Promise.all([
              controller
                .account(chainId)
                .invokeFunction(registerData.invoke.invocation, {
                  ...registerData.invoke.details,
                  nonce: registerData.invoke.details.nonce!,
                }),
              controller.account(chainId).execute(calls, null, {
                maxFee: fees.max,
                nonce: nonce.add(number.toBN(1)),
                version: hash.transactionVersion,
              }),
            ]);
          };
        }),
      );
    },
    [controller, chainId, fees, nonce, registerData],
  );

  // Estimate fees
  useEffect(() => {
    if (!controller || !nonce || !calls) {
      return;
    }

    async function register() {
      const account = controller.account(chainId);
      if (account.registered) {
        if (maxFee) {
          setFees({
            base: number.toBN(maxFee),
            max: number.toBN(maxFee),
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
    controller,
    nonce,
    registerData,
    setError,
    setFees,
    calldata,
    calls,
    chainId,
    maxFee,
  ]);

  useEffect(() => {
    const hash = Storage.get(
      selectors[VERSION].deployment(controller.address, chainId),
    ).txnHash;

    // not deployed
    // if (!controller.account(chainId).deployed) {
    //   router.push(
    //     `/pending?txns=${encodeURIComponent(
    //       JSON.stringify([{ name: "Account Deployment", hash }]),
    //     )}`,
    //   );
    //   return;
    // }

    // not registered
    // if (!controller.account(chainId).registered) {
    //   if (hash) {
    //     router.push(
    //       `/pending?txns=${encodeURIComponent(
    //         JSON.stringify([{ name: "Device Registration", hash }]),
    //       )}`,
    //     );
    //     return;
    //   }

    //   const regData = Storage.get(
    //     selectors[VERSION].register(controller.address, chainId),
    //   );
    //   if (regData) {
    //     setRegisterData(regData);
    //   }
    // }

    // get nonce
    controller
      .account(chainId)
      .getNonce()
      .then((n: BN) => {
        setNonce(number.toBN(n));
      });
  }, [chainId, controller]);

  const onRegister = useCallback(async () => {
    setLoading(true);
    const txn = await controller
      .account(chainId)
      .invokeFunction(registerData.invoke.invocation, {
        ...registerData.invoke.details,
        nonce: registerData.invoke.details.nonce!,
      });

    Storage.update(selectors[VERSION].deployment(controller.address, chainId), {
      txnHash: txn.transaction_hash,
    });

    controller.account(chainId).sync();
  }, [chainId, controller, registerData]);

  const onSubmit = useCallback(async () => {
    setLoading(true);
    await controller.account(chainId).execute(calls, null, {
      maxFee: fees.max,
      nonce,
      version: hash.transactionVersion,
    });
    // We set the transaction hash which the keychain instance
    // polls for. We use a manually computed hash to identify
    // the transaction since the keychain estimate fee might be differen.
    Storage.set(
      selectors[VERSION].transaction(
        controller.address,
        hash.calculateTransactionHash(
          controller.address,
          hash.transactionVersion,
          calldata,
          maxFee,
          chainId,
          nonce,
        ),
      ),
      true,
    );
    setLoading(false);
    confirm();
  }, [controller, nonce, calldata, calls, chainId, fees.max, maxFee]);

  if (error) {
    return (
      <>
        <Header address={controller.address} />
        <div>{error.message}</div>
      </>
    );
  }

  return (
    <>
      <Header address={controller.address} />
      <Flex m={4} flex={1} flexDirection="column">
        <Banner
          title="Execute Transactions"
          description={`${url.href} is requesting to execute the following transactions`}
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
    </>
  );
};

export default Execute;
