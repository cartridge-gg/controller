import { Flex, HStack, Text } from "@chakra-ui/react";

import { constants } from "starknet";
import { Banner } from "components/Banner";
import Footer from "components/Footer";
import InfoIcon from "@cartridge/ui/components/icons/Info";
import { useCallback, useState } from "react";
import selectors from "utils/selectors";
import Controller, { RegisterData, VERSION } from "utils/controller";
import Storage from "utils/storage";

const Register = ({
  chainId,
  controller,
  onSubmit,
  onCancel,
}: {
  controller: Controller,
  chainId: constants.StarknetChainId;
  onSubmit: () => void;
  onCancel: () => void;
}) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [registerData, setRegisterData] = useState<RegisterData>();

  const onRegister = useCallback(async () => {
    const txn = await controller
      .account(chainId)
      .invokeFunction(registerData.invoke.invocation, {
        ...registerData.invoke.details,
        nonce: registerData.invoke.details.nonce!,
      });

    Storage.update(
      selectors[VERSION].deployment(controller.address, chainId),
      { txnHash: txn.transaction_hash },
    );

    controller.account(chainId).sync();
  }, [chainId, controller, registerData]);

  return (
    <Flex m={4} flex={1} flexDirection="column">
      <Banner
        pb="20px"
        title="Register Device"
        description="It looks like this is your first time using this device with this chain.
      You will need to register it before you can execute transactions."
        icon={<InfoIcon boxSize="30px" />}
        chainId={chainId}
      />
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
              Create Session
            </Text>
            <InfoIcon />
          </HStack>
        </HStack>
        <Footer
          isLoading={isLoading}
          onConfirm={onRegister}
          onCancel={onCancel}
          confirmText="Register"
        ></Footer>
      </Flex>
    </Flex>
  );
}

export default Register;
