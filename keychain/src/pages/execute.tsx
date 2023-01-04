import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";

import { Header } from "components/Header";
import Controller, { RegisterData, VERSION } from "utils/controller";
import { useRouter } from "next/router";
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
import Network from "components/Network";
import { Call } from "components/Call";
import Footer from "components/Footer";
import { normalize, validate } from "pages";
import { estimateFeeBulk } from "utils/gateway";
import { BigNumber } from "ethers";
import selectors from "utils/selectors";
import Register from "components/Register";
import Fees from "components/Fees";
import JoystickIcon from "@cartridge/ui/src/components/icons/Joystick";

const Execute: NextPage = () => {
  const [registerData, setRegisterData] = useState<RegisterData>();
  const [nonce, setNonce] = useState<BigNumber>();
  const [fees, setFees] = useState<{
    base: number.BigNumberish;
    max: number.BigNumberish;
  }>();
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const controller = useMemo(() => Controller.fromStore(), []);
  const router = useRouter();

  const url = useMemo(() => {
    const { origin } = router.query;
    if (!origin) {
      return;
    }
    const url = new URL(origin as string);
    return url;
  }, [router.query]);

  const params = useMemo(() => {
    if (!controller.address || !router.query.calls) {
      return null;
    }

    const { maxFee, chainId } = router.query as {
      chainId?: constants.StarknetChainId;
      maxFee?: string;
    };
    const calls: StarknetCall | StarknetCall[] = JSON.parse(
      router.query.calls as string,
    );
    const transactions = Array.isArray(calls) ? calls : [calls];
    const calldata = transaction.fromCallsToExecuteCalldata(transactions);

    return {
      calls: transactions,
      calldata,
      maxFee,
      chainId: chainId ? chainId : constants.StarknetChainId.TESTNET,
    };
  }, [controller.address, router.query]);

  const execute = useCallback(
    (calls: StarknetCall[]) => {
      const account = controller.account(params.chainId);
      return normalize(
        validate((controller) => {
          return async () => {
            if (account.registered) {
              return await controller
                .account(params.chainId)
                .execute(calls, null, {
                  maxFee: fees.max,
                  nonce,
                  version: hash.transactionVersion,
                });
            }

            return await Promise.all([
              controller
                .account(params.chainId)
                .invokeFunction(registerData.invoke.invocation, {
                  ...registerData.invoke.details,
                  nonce: registerData.invoke.details.nonce!,
                }),
              controller.account(params.chainId).execute(calls, null, {
                maxFee: fees.max,
                nonce: nonce.add(number.toBN(1)),
                version: hash.transactionVersion,
              }),
            ]);
          };
        }),
      );
    },
    [controller, fees, nonce, params, registerData],
  );

  // Get the nonce
  useEffect(() => {
    if (!controller || !params) {
      return;
    }

    controller
      .account(params.chainId)
      .getNonce()
      .then((n: number.BigNumberish) => {
        setNonce(number.toBN(n));
      });
  }, [controller, params, setNonce]);

  // Estimate fees
  useEffect(() => {
    if (!controller || !nonce || !params.calls) {
      return;
    }

    async function register() {
      const account = controller.account(params.chainId);
      if (account.registered) {
        if (params.maxFee) {
          setFees({
            base: number.toBN(params.maxFee),
            max: number.toBN(params.maxFee),
          });
          return;
        }
        const fees = await account.estimateInvokeFee(params.calls, { nonce });
        setFees({ base: fees.overall_fee, max: fees.suggestedMaxFee });
      } else if (!account.registered && registerData) {
        try {
          const nextNonce = number.toHex(nonce.add(number.toBN(1)));
          const signerDetails = {
            walletAddress: controller.address,
            nonce: nextNonce,
            maxFee: constants.ZERO,
            version: hash.transactionVersion,
            chainId: params.chainId,
          };

          const signature = await controller.signer.signTransaction(
            params.calls,
            signerDetails,
          );

          const estimates = (await estimateFeeBulk(params.chainId, [
            registerData.invoke,
            {
              invocation: {
                contractAddress: controller.address,
                calldata: params.calldata,
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
  }, [controller, nonce, params, registerData, setError, setFees]);

  useEffect(() => {
    if (!controller) {
      router.replace(
        `${
          process.env.NEXT_PUBLIC_SITE_URL
        }/login?redirect_uri=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    if (params) {
      // not deployed, show pending tx
      if (!controller.account(params.chainId).deployed) {
        const hash = Storage.get(
          selectors[VERSION].deployment(controller.address, params.chainId),
        ).deployTx;

        const txn = { name: "Account Deployment", hash };
        router.push(
          `/pending?txns=${encodeURIComponent(JSON.stringify([txn]))}`,
        );
      }
    }
  }, [router, controller, params]);

  const onRegister = useCallback(async () => {
    setLoading(true);
    const data = await controller.signAddDeviceKey(params.chainId);
    Storage.set(
      selectors[VERSION].register(controller.address, params.chainId),
      data,
    );
    setRegisterData(data);
    setLoading(false);
  }, [controller, params]);

  const onSubmit = useCallback(async () => {
    setLoading(true);
    await execute(params.calls)(url.href)();
    // We set the transaction hash which the keychain instance
    // polls for. We use a manually computed hash to identify
    // the transaction since the keychain estimate fee might be differen.
    Storage.set(
      selectors[VERSION].transaction(
        controller.address,
        hash.calculateTransactionHash(
          controller.address,
          hash.transactionVersion,
          params.calldata,
          params.maxFee,
          params.chainId,
          nonce,
        ),
      ),
      true,
    );
    setLoading(false);
    if (window.opener) {
      window.close();
    }
  }, [controller, execute, nonce, params, url]);

  if (error) {
    return (
      <>
        <Header address={controller.address} />
        <div>{error.message}</div>
      </>
    );
  }

  if (!url || !params || !controller) {
    return <Header address={controller.address} />;
  }

  const { deployed, registered } = controller.account(params.chainId);
  if (deployed && !registered) {
    return (
      <>
        <Header address={controller.address} />
        <Register
          chainId={params.chainId}
          onSubmit={onRegister}
          isLoading={isLoading}
        />
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
          chainId={params.chainId}
          pb="20px"
        />
        <Flex my={2} flex={1} flexDirection="column" gap="10px">
          {params.calls.map((call, i) => (
            <Call
              key={i}
              chainId={params.chainId}
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
            onCancel={() => {
              if (window.opener) {
                window.close();
              }
            }}
          >
            <Fees chainId={params.chainId} fees={fees} />
          </Footer>
        </Flex>
      </Flex>
    </>
  );
};

export default dynamic(() => Promise.resolve(Execute), { ssr: false });
