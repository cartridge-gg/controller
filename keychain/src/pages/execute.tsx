import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Flex, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { StarknetChainId, ZERO } from "starknet/constants";

import { Header } from "components/Header";
import Controller, { RegisterData } from "utils/account";
import { useRouter } from "next/router";
import { Call as StarknetCall, EstimateFee } from "starknet";
import Storage from "utils/storage";
import Banner from "components/Banner";
import Network from "components/Network";
import { Call } from "components/Call";
import Footer from "components/Footer";
import InfoIcon from "@cartridge/ui/components/icons/Info";
import { normalize, validate } from "pages";
import { BigNumberish, toBN, toHex } from "starknet/utils/number";
import { estimateFeeBulk } from "utils/gateway";
import { transactionVersion } from "starknet/utils/hash";
import { fromCallsToExecuteCalldata } from "starknet/utils/transaction";
import { BigNumber } from "ethers";

const Unlock = ({ chainId, onSubmit }: { chainId: StarknetChainId, onSubmit: () => void }) => (
  <Flex m={4} flex={1} flexDirection="column">
    <Banner
      pb="20px"
      title="Register Device"
      variant="secondary"
      borderBottom="1px solid"
      borderColor="gray.700"
    >
      It looks like this is your first time using this device with this chain. You will need to register it before you can execute transactions.
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
        justifyContent="space-between">
        <HStack>
          <Text textTransform="uppercase" fontSize={11} fontWeight={700} color="gray.100">
            Register Device
          </Text>
          <InfoIcon />
        </HStack>
      </HStack>
      <Footer onSubmit={onSubmit} onCancel={() => {
        if (window.opener) {
          window.close()
        }
      }} action="Register"></Footer>
    </Flex>
  </Flex>
)

const Fees = ({ fees }: { fees?: EstimateFee }) => (
  <HStack
    alignItems="center"
    spacing="12px"
    bgColor="gray.700"
    py="11px"
    px="15px"
    borderRadius="8px"
    justifyContent="space-between">
    <HStack>
      <Text textTransform="uppercase" fontSize={11} fontWeight={700} color="gray.100">
        Network Fees
      </Text>
      <InfoIcon />
    </HStack>
    <VStack alignItems="flex-end">
      {
        fees ? <>
          <Text fontSize={13}>~${fees.overall_fee}</Text>
          <Text fontSize={11} color="gray.200" mt="1px !important">Max: ~$${fees.suggestedMaxFee}</Text>
        </> : <Spinner />
      }
    </VStack>
  </HStack>
)

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

  const execute = useCallback((calls: StarknetCall[],) => normalize(validate((controller) => {
    return async () => {
      return await controller.execute(calls, []);
    }
  })), [])

  const params = useMemo(() => {
    if (
      !controller.address ||
      !router.query.calls
    ) {
      return null;
    }

    const { maxFee, chainId } = router.query as {
      chainId?: StarknetChainId;
      maxFee?: string;
    };
    const calls: StarknetCall | StarknetCall[] = JSON.parse(router.query.calls as string);
    const transactions = Array.isArray(calls) ? calls : [calls];

    return { calls: transactions, maxFee, chainId: chainId ? chainId : StarknetChainId.TESTNET };
  }, [controller.address, router.query]);

  // Get the nonce
  useEffect(() => {
    if (!controller) {
      return;
    }

    controller.getNonce().then((n: BigNumberish) => {
      setNonce(toBN(n));
    })
  }, [controller, setNonce])

  // Estimate fees
  useEffect(() => {
    if (!controller || !nonce || !params.calls) {
      return;
    }

    async function register() {
      if (!controller.isRegistered(params.chainId) && !registerData) {
        return;
      } else if (!controller.isRegistered(params.chainId) && registerData) {
        try {
          const nextNonce = toHex(nonce.add(toBN(1)))
          const signerDetails = {
            walletAddress: controller.address,
            nonce: nextNonce,
            maxFee: ZERO,
            version: transactionVersion,
            chainId: params.chainId,
          };

          const signature = await controller.signer.signTransaction(params.calls, signerDetails);
          const calldata = fromCallsToExecuteCalldata(params.calls);

          const estimate = await estimateFeeBulk(params.chainId, [registerData.invoke, {
            invocation: { contractAddress: controller.address, calldata, signature },
            details: { version: transactionVersion, nonce: nextNonce, maxFee: ZERO },
          }])
          setFees(estimate)
        } catch (e) {
          console.error(e)
          setError(e)
          return;
        }
      }
    }

    register();
  }, [controller, nonce, params, registerData, setError])

  useEffect(() => {
    if (!controller) {
      router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/welcome`);
      return;
    }
  }, [router, controller]);

  const onRegister = useCallback(async () => {
    const data = await controller.signAddDeviceKey(params.chainId)
    Storage.set(`@register/${params.chainId}/set_device_key`, data)
    setRegisterData(data)
  }, [controller, params])

  const onSubmit = useCallback(
    async () => {
      const res = await execute(params.calls)(url.href)();
      // We set the transaction hash which the keychain instance
      // polls for.
      Storage.set(`@transaction/${res.transaction_hash}`, true);

      if (window.opener) {
        window.close();
      }
    },
    [execute, params, url],
  );

  if (!url || !params || !controller) {
    return (
      <Header address={controller.address} />
    );
  }

  if (!controller.isRegistered(params.chainId) && !registerData) {
    return (
      <>
        <Header address={controller.address} />
        <Unlock chainId={params.chainId} onSubmit={onRegister} />
      </>
    )
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
          {
            params.calls.map((call, i) => <Call key={i} policy={{
              target: call.contractAddress,
              method: call.entrypoint,
            }} />)
          }
          <Footer isDisabled={!fees} onSubmit={onSubmit} onCancel={() => {
            if (window.opener) {
              window.close()
            }
          }} action="Confirm"><Fees fees={fees} /></Footer>
        </Flex>
      </Flex>
    </>
  );
};

export default dynamic(() => Promise.resolve(Execute), { ssr: false });
