import { AlertIcon } from "@cartridge/ui";
import { Button, VStack, Text, HStack, Input } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { useEffect, useState } from "react";
import { CallData, num } from "starknet";

export function SetDelegate({
  onClose,
  onSetDelegate,
  defaultAddress,
}: {
  onClose: () => void;
  onSetDelegate: (address: string) => void;
  defaultAddress: string;
}) {
  const [delegateAddress, setDelegateAddress] = useState(defaultAddress);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      CallData.compile([delegateAddress]);
      setIsValid(num.isHex(delegateAddress));
    } catch (e: any) {
      setIsValid(false);
    }
  }, [delegateAddress]);

  return (
    <Container variant="menu" title="Set delegate account">
      <Content>
        <VStack w="full" h="full" justifyContent="space-between" gap={6}>
          <Text textAlign="center" color="text.secondary" fontSize="sm">
            Your controller can be owned by an existing Starknet wallet which
            can receive the rewards you earn while playing. <br />
            (This can be updated later)
          </Text>
          <VStack w="full">
            <Input
              w="full"
              fontSize="10px"
              placeholder="0x..."
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            {!isValid && delegateAddress !== "" && (
              <HStack w="full" color="red.400">
                <AlertIcon /> <Text color="red.400">Invalid address!</Text>
              </HStack>
            )}
          </VStack>
        </VStack>
      </Content>
      <Footer>
        <Button
          colorScheme="colorful"
          w="full"
          onClick={() => onSetDelegate(delegateAddress)}
          isDisabled={!isValid}
        >
          Set delegate account
        </Button>
        <Button w="full" onClick={onClose}>
          Setup later
        </Button>
      </Footer>
    </Container>
  );
}
