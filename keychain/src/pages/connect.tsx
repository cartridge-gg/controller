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
import PlugIcon from "@cartridge/ui/components/icons/Plug";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import LaptopIcon from "@cartridge/ui/components/icons/Laptop";

import { Banner } from "components/Banner";

const Connect: NextPage = () => {
  const [maxFee, setMaxFee] = useState(null);
  const [registerDevice, setRegisterDevice] = useState(false);
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
      if (!account.registered && !account.pending) {
        setRegisterDevice(true);
        return;
      }
    }
  }, [router, controller, account]);

  const connect = useCallback(
    async (values, actions) => {
      try {
        const approvals = validPolicys.filter((_, i) => values[i]);
        controller.approve(origin, approvals, maxFee);

        // show pending screen if controller still being deployed
        if (account.pending) {
          const hash = Storage.get(
            selectors[VERSION].deployment(controller.address, chainId),
          ).deployTx;

          const txn = { name: "Register Device", hash };
          router.push(
            `/pending?txns=${encodeURIComponent(JSON.stringify([txn]))}`,
          );
          return;
        }

        if (registerDevice) {
          const data = await controller.signAddDeviceKey(chainId);
          Storage.set(
            selectors[VERSION].register(controller.address, chainId),
            data,
          );
        }

        if (window.opener) {
          window.close();
        }
      } catch (e) {
        console.error(e);
      }
      actions.setSubmitting(false);
    },
    [
      router,
      origin,
      validPolicys,
      controller,
      maxFee,
      chainId,
      registerDevice,
      account,
    ],
  );

  if (!controller) {
    return <></>;
  }

  return (
    <>
      <Header address={controller.address} />
      <Container w={["full", "full", "400px"]} centerContent>
        <Flex w="full" m={4} flexDirection="column" gap="18px">
          <Banner
            title="Create Session"
            description={`${origin} is requesting to connect to your Cartridge Controller`}
            icon={<PlugIcon boxSize="30px" />}
            chainId={chainId}
          />
          {registerDevice && (
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
