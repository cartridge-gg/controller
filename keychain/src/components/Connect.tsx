import { useCallback, useEffect, useMemo, useState } from "react";
import {
  VStack,
  HStack,
  Flex,
  Text,
  Spacer,
  Container,
} from "@chakra-ui/react";

import Session from "components/Session";
import Controller from "utils/controller";
import PlugIcon from "@cartridge/ui/src/components/icons/Plug";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import LaptopIcon from "@cartridge/ui/src/components/icons/Laptop";
import { Banner } from "components/Banner";
import { constants } from "starknet";
import { Policy } from "@cartridge/controller";

const Connect = ({
  controller,
  chainId,
  policys,
  origin,
  onConnect,
  onCancel,
}: {
  controller: Controller;
  chainId: constants.StarknetChainId;
  policys: Policy[];
  origin: string;
  onConnect: ({
    address,
    policies,
  }: {
    address: string;
    policies: Policy[];
  }) => void;
  onCancel: () => void;
}) => {
  const [maxFee, setMaxFee] = useState(null);
  const [registerDevice, setRegisterDevice] = useState(false);
  const account = controller.account(chainId);

  useEffect(() => {
    if (account) {
      if (account.deployed && !account.registered) {
        setRegisterDevice(true);
        return;
      }
    }
  }, [controller, account]);

  const connect = useCallback(
    async (values, actions) => {
      try {
        const approvals = policys.filter((_, i) => values[i]);
        controller.approve(origin, approvals, maxFee);
        onConnect({ address: controller.address, policies: approvals });
      } catch (e) {
        console.error(e);
      }
      actions.setSubmitting(false);
    },
    [origin, onConnect, policys, controller, maxFee],
  );

  return (
    <Container w={["full", "full", "400px"]} centerContent>
      <Flex w="full" m={4} flexDirection="column" gap="18px">
        <Banner
          title="Create Session"
          description={`${origin} is requesting to connect to your Cartridge Controller`}
          icon={<PlugIcon boxSize="30px" />}
          chainId={chainId}
        />
        {false && (
          <VStack w="full" overflow="hidden" borderRadius="6px" spacing="1px">
            <VStack bgColor="gray.700" w="full" p="12px" align="flex-start">
              <Text variant="ibm-upper-bold" fontSize="10px" color="gray.200">
                Register Session
              </Text>
              <Text fontSize="11px" color="gray.200">
                Authorize your controller to perform actions from this
                application.
              </Text>
            </VStack>
            <HStack bgColor="gray.600" py="7px" px="12px" w="full">
              <LaptopIcon boxSize="18px" />
              <Text fontSize="13px">Register Session</Text>
              <Spacer />
            </HStack>
          </VStack>
        )}
        <Session
          chainId={chainId}
          action={"CREATE"}
          onCancel={onCancel}
          onSubmit={connect}
          policies={policys}
          invalidPolicys={[]}
          isLoading={false}
          maxFee={maxFee}
          setMaxFee={setMaxFee}
        />
      </Flex>
    </Container>
  );
};

export default Connect;
