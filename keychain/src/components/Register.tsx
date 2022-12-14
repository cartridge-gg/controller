import { Flex, HStack, Text } from "@chakra-ui/react";

import {
  constants,
} from "starknet";
import Banner from "components/Banner";
import Network from "components/Network";
import Footer from "components/Footer";
import InfoIcon from "@cartridge/ui/components/icons/Info";

const Register = ({
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

export default Register;