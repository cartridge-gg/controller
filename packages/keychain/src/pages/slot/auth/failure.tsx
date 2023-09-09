import { NextPage } from "next";
import { Container, PortalBanner } from "components";
import { AlertDuoIcon } from "@cartridge/ui/lib";
import { VStack, Text } from "@chakra-ui/react";

const Consent: NextPage = () => {
  return (
    <Container hideAccount>
      <PortalBanner
        icon={<AlertDuoIcon boxSize={8} accent="text.error" />}
        title="Failure"
        description="Uh-oh something went wrong"
      />

      <VStack p={3} borderRadius="md" bg="solid.primary" w="full">
        <Text fontSize="xs" align="center" color="text.secondaryAccent">
          If this problem persists swing by the Cartridge
          <Text color="inherit">support channel on Discord</Text>
        </Text>
      </VStack>
    </Container>
  );
};

export default Consent;
