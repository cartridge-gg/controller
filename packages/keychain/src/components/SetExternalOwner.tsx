import { AlertIcon } from "@cartridge/ui";
import { Button, VStack, Text, HStack, Input } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { useConnection } from "hooks/connection";
import { useEffect, useState } from "react";
import { CallData, num } from "starknet";

export function SetExternalOwner() {
  const { context, openSettings, setExternalOwnerTransaction } =
    useConnection();
  const [externalOwnerAddress, setExternalOwnerAddress] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      CallData.compile([externalOwnerAddress]);
      setIsValid(num.isHex(externalOwnerAddress));
    } catch (e: any) {
      setIsValid(false);
    }
  }, [externalOwnerAddress]);

  return (
    <Container
      variant="menu"
      title="Recovery Account(s)"
      onBack={() => openSettings(context)}
    >
      <Content>
        <VStack w="full" h="full" justifyContent="space-between" gap={6}>
          <Text color="text.secondary" fontSize="sm">
            Your controller can be owned by an existing Starknet wallet
          </Text>
          <VStack w="full">
            <Input
              w="full"
              // fontSize="10px"
              placeholder="0x..."
              value={externalOwnerAddress}
              onChange={(e) => setExternalOwnerAddress(e.target.value)}
            />
            {!isValid && externalOwnerAddress !== "" && (
              <HStack w="full" color="red.400">
                <AlertIcon /> <Text color="red.400">Invalid address!</Text>
              </HStack>
            )}
          </VStack>
        </VStack>
      </Content>
      <Footer hideTxSummary>
        <Button
          colorScheme="colorful"
          w="full"
          onClick={() =>
            setExternalOwnerTransaction(context, externalOwnerAddress)
          }
          isDisabled={!isValid}
        >
          Add Recovery Account
        </Button>
      </Footer>
    </Container>
  );
}
