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
  Box,
  Container,
} from "@chakra-ui/react";

import Banner from "components/Banner";
import { Header } from "components/Header";
import Session from "components/Session";
import { useRequests } from "hooks/account";
import { useUrlPolicys } from "hooks/policy";
import { constants } from "starknet";
import Storage from "utils/storage";
import selectors from "utils/selectors";
import Controller, { RegisterData, VERSION } from "utils/controller";
import ConnectIcon from "../../../ui/src/components/icons/Connect";

const Connect: NextPage = () => {
  const [maxFee, setMaxFee] = useState(null);
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const { chainId, validPolicys, invalidPolicys, isValidating } =
    useUrlPolicys();
  const controller = useMemo(() => Controller.fromStore(), []);
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

    const account = controller.account(chainId);
    if (!account?.registered) {
      setRegistrationRequired(true);
    }
  }, [router, controller, chainId]);

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
        <Flex w="full" m={4} flexDirection="column">
          <VStack gap="12px">
            <Circle bgColor="gray.700" size="48px">
              <ConnectIcon boxSize="20px" />
            </Circle>
            <Text fontSize="17px" fontWeight="bold">
              Connect Controller
            </Text>
            <Text fontSize="13px" color="gray.200" align="center">
              {origin} is requesting to connect to your Cartridge Controller
            </Text>
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
                <Text variant="ibm-upper-bold" fontSize="10px">
                  Register New device
                </Text>
                <Text fontSize="11px" color="gray.200">
                  Allow this device to execute transactions
                </Text>
              </VStack>
              <Flex m="0" w="full" gap="1px">
                <HStack flex="1" bgColor="gray.600" py="7px" px="12px">
                  <Text fontSize="13px">My device</Text>
                </HStack>
                <HStack bgColor="gray.600" py="7px" px="12px">
                  <Text
                    fontSize="10px"
                    variant="ibm-upper-bold"
                    color="gray.200"
                  >
                    {chainId === constants.StarknetChainId.MAINNET
                      ? "mainnet"
                      : "testnet"}
                  </Text>
                </HStack>
              </Flex>
            </VStack>
          )}
          <Session
            chainId={chainId}
            action={"CONNECT"}
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
