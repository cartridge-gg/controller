import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Circle,
  VStack,
  HStack,
  Flex,
  Text,
  Spacer,
  Box,
  Container,
} from "@chakra-ui/react";

import { Header } from "components/Header";
import Session from "components/Session";
import { useRequests } from "hooks/account";
import { useUrlPolicys } from "hooks/policy";
import { constants } from "starknet";
import Storage from "utils/storage";
import selectors from "utils/selectors";
import Controller, { VERSION } from "utils/controller";
import FingerprintIcon from "@cartridge/ui/components/icons/Fingerprint";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import StarknetIcon from "@cartridge/ui/components/icons/Starknet";
import LaptopIcon from "@cartridge/ui/components/icons/Laptop";

const Connect: NextPage = () => {
  const [maxFee, setMaxFee] = useState(null);
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const { chainId, validPolicys, invalidPolicys, isValidating } =
    useUrlPolicys();
  const { origin } = useRequests();
  const controller = useMemo(() => Controller.fromStore(), []);
  const account = controller?.account(chainId);
  const router = useRouter();

  useEffect(() => {
    if (!controller) {
      router.replace(
        `${
          process.env.NEXT_PUBLIC_ADMIN_URL
        }/login?redirect_uri=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    if (account) {
      if (!account.deploymentTx()) {
        setRegistrationRequired(true);
        return;
      }
    }
  }, [router, controller, account]);

  const connect = useCallback(
    async (values, actions) => {
      try {
        if (registrationRequired) {
          const data = await controller.signAddDeviceKey(chainId);
          Storage.set(
            selectors[VERSION].register(controller.address, chainId),
            data,
          );
        }

        const approvals = validPolicys.filter((_, i) => values[i]);
        controller.approve(origin, approvals, maxFee);
        if (window.opener) {
          window.close();
        }
      } catch (e) {
        console.error(e);
      }
      actions.setSubmitting(false);
    },
    [validPolicys, controller, maxFee, chainId, registrationRequired],
  );

  if (!controller) {
    return <></>;
  }

  return (
    <>
      <Header address={controller.address} />
      <Container w={["full", "full", "400px"]} centerContent>
        <Flex w="full" m={4} flexDirection="column" gap="18px">
          <VStack gap="5px">
            <Circle bgColor="gray.700" size="48px">
              <FingerprintIcon boxSize="30px" />
            </Circle>
            <Text fontSize="17px" fontWeight="bold">
              Create Session
            </Text>
            <Text fontSize="13px" color="gray.200" align="center">
              {origin} is requesting to connect to your Cartridge Controller
            </Text>
            <HStack py="7px" px="12px" bgColor="gray.700" borderRadius="full">
              <StarknetIcon boxSize="14px" />
              <Text fontSize="10px" variant="ibm-upper-bold">
                {chainId === constants.StarknetChainId.MAINNET
                  ? "mainnet"
                  : "testnet"}
              </Text>
            </HStack>
          </VStack>
          {registrationRequired && (
            <VStack
              w="full"
              mt="30px"
              overflow="hidden"
              borderRadius="6px"
              spacing="1px"
            >
              <VStack bgColor="gray.700" w="full" p="12px" align="flex-start">
                <Text variant="ibm-upper-bold" fontSize="10px" color="gray.200">
                  Register New device
                </Text>
                <Text fontSize="11px" color="gray.200">
                  Authorize your controller to perform actions on this device
                </Text>
              </VStack>
              <HStack bgColor="gray.600" py="7px" px="12px" w="full">
                <LaptopIcon boxSize="18px" />
                <Text fontSize="13px">New Device</Text>
                <Spacer />
                <InfoIcon color="gray.200" boxSize="12px" />
              </HStack>
            </VStack>
          )}
          <Session
            chainId={chainId}
            action={"CREATE"}
            onCancel={() => {
              if (window.opener) {
                window.close();
              }
            }}
            onSubmit={connect}
            policies={validPolicys}
            invalidPolicys={invalidPolicys}
            isLoading={isValidating}
            maxFee={maxFee}
            setMaxFee={setMaxFee}
          />
        </Flex>
      </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(Connect), { ssr: false });
