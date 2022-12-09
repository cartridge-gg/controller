import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Flex, HStack, Spinner, Text, VStack } from "@chakra-ui/react";

import { Header } from "components/Header";
import Controller, { RegisterData } from "utils/controller";
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
import Banner from "components/Banner";
import Network from "components/Network";
import { Call } from "components/Call";
import Footer from "components/Footer";
import InfoIcon from "@cartridge/ui/components/icons/Info";
import { normalize, validate } from "pages";
import { estimateFeeBulk } from "utils/gateway";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

async function fetchEthPrice() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: `{"query":"query { price(quote: ETH, base: USD) { amount }}"}`,
  });
  return res.json();
}

const Unlock = ({
  chainId,
  onSubmit,
}: {
  chainId: constants.StarknetChainId;
  onSubmit: () => void;
}) => (
  <Flex m={4} flex={1} flexDirection="column">
    <Banner
      pb="20px"
      title="Register Device"
      variant="secondary"
      borderBottom="1px solid"
      borderColor="gray.700"
    >
      It looks like this is your first time using this device with this chain.
      You will need to register it before you can execute transactions.
      <Flex justify="center" mt="12px">
        <Network chainId={chainId} />
      </Flex>
    </Banner>
    <Flex my={2} flex={1} flexDirection="column" gap="10px">
      <HStack
        alignItems="center"
        spacing="12px"
        bgColor="gray.700"
        py="11px"
        px="15px"
        borderRadius="8px"
        justifyContent="space-between"
      >
        <HStack>
          <Text
            textTransform="uppercase"
            fontSize={11}
            fontWeight={700}
            color="gray.100"
          >
            Register Device
          </Text>
          <InfoIcon />
        </HStack>
      </HStack>
      <Footer
        onSubmit={onSubmit}
        onCancel={() => {
          if (window.opener) {
            window.close();
          }
        }}
        action="Register"
      ></Footer>
    </Flex>
  </Flex>
);

const Fees = ({ chainId, fees }: { chainId: constants.StarknetChainId, fees?: EstimateFee }) => {
  const [formattedFee, setFormattedFee] = useState<{
    fee: string;
    max: string;
  }>();
  useEffect(() => {
    if (!fees) {
      return;
    }

    async function compute() {
      if (chainId === constants.StarknetChainId.MAINNET) {
        let dollarUSLocale = Intl.NumberFormat("en-US");
        const { data } = await fetchEthPrice();
        const usdeth = number.toBN(data.price.amount * 100);
        const overallFee = fees.overall_fee.mul(usdeth).toString();
        const suggestedMaxFee = fees.suggestedMaxFee.mul(usdeth).toString();
        setFormattedFee({
          fee: dollarUSLocale.format(parseFloat(formatUnits(overallFee, 20))),
          max: dollarUSLocale.format(parseFloat(formatUnits(suggestedMaxFee, 20))),
        });
        return;
      }

      setFormattedFee({
        fee: parseFloat(formatUnits(fees.overall_fee, 18)).toFixed(5),
        max: parseFloat(formatUnits(fees.suggestedMaxFee, 18)).toFixed(5),
      });
    }
    compute();
  }, [chainId, fees]);

  return (
    <HStack
      alignItems="center"
      spacing="12px"
      bgColor="gray.700"
      py="11px"
      px="15px"
      borderRadius="8px"
      justifyContent="space-between"
    >
      <HStack>
        <Text
          textTransform="uppercase"
          fontSize={11}
          fontWeight={700}
          color="gray.100"
        >
          Network Fees
        </Text>
        <InfoIcon />
      </HStack>
      <VStack alignItems="flex-end">
        {formattedFee ? (
          <>
            <Text fontSize={13}>~${formattedFee.fee}</Text>
            <Text fontSize={11} color="gray.200" mt="1px !important">
              Max: ~${formattedFee.max}
            </Text>
          </>
        ) : (
          <Spinner />
        )}
      </VStack>
    </HStack>
  );
};

const Execute: NextPage = () => {
  const [registerData, setRegisterData] = useState<RegisterData>();
  const [nonce, setNonce] = useState<BigNumber>();
  const [fees, setFees] = useState<EstimateFee>();
  const [error, setError] = useState<Error>();
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

    return {
      calls: transactions,
      maxFee,
      chainId: chainId ? chainId : constants.StarknetChainId.TESTNET,
    };
  }, [controller.address, router.query]);

  const execute = useCallback(
    (calls: StarknetCall[]) =>
      normalize(
        validate((controller) => {
          return async () => {
            return await controller.account(params.chainId).execute(calls);
          };
        }),
      ),
    [params],
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
        const fees = await account.estimateInvokeFee(params.calls, { nonce });
        setFees(fees);
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
          const calldata = transaction.fromCallsToExecuteCalldata(params.calls);

          const estimates = (await estimateFeeBulk(params.chainId, [
            registerData.invoke,
            {
              invocation: {
                contractAddress: controller.address,
                calldata,
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
          setFees(fees);
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
        `${process.env.NEXT_PUBLIC_ADMIN_URL
        }/welcome?redirect_uri=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }
  }, [router, controller]);

  const onRegister = useCallback(async () => {
    const data = await controller.signAddDeviceKey(params.chainId);
    Storage.set(`@register/${params.chainId}/set_device_key`, data);
    setRegisterData(data);
  }, [controller, params]);

  const onSubmit = useCallback(async () => {
    const res = await execute(params.calls)(url.href)();
    // We set the transaction hash which the keychain instance
    // polls for.
    Storage.set(`@transaction/${res.transaction_hash}`, true);

    if (window.opener) {
      window.close();
    }
  }, [execute, params, url]);

  if (!url || !params || !controller) {
    return <Header address={controller.address} />;
  }
  if (!controller.account(params.chainId).registered && !registerData) {
    return (
      <>
        <Header address={controller.address} />
        <Unlock chainId={params.chainId} onSubmit={onRegister} />
      </>
    );
  }

  return (
    <>
      <Header address={controller.address} />
      <Flex m={4} flex={1} flexDirection="column">
        <Banner
          pb="20px"
          title="Execute Transactions"
          variant="secondary"
          borderBottom="1px solid"
          borderColor="gray.700"
        >
          {`${url.href} is requesting to execute the following transactions`}
          <Flex justify="center" mt="12px">
            <Network chainId={params.chainId} />
          </Flex>
        </Banner>
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
            isDisabled={!fees}
            onSubmit={onSubmit}
            onCancel={() => {
              if (window.opener) {
                window.close();
              }
            }}
            action="Confirm"
          >
            <Fees chainId={params.chainId} fees={fees} />
          </Footer>
        </Flex>
      </Flex>
    </>
  );
};

export default dynamic(() => Promise.resolve(Execute), { ssr: false });
