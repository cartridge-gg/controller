import { AlertIcon } from "@cartridge/ui";
import { Button, VStack, Text, HStack, Input } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { useConnection } from "hooks/connection";
import { useEffect, useState } from "react";
import { CallData, num } from "starknet";

export function SetDelegate({
  onSetDelegate,
}: {
  onSetDelegate: (address: string) => void;
}) {
  const { context, openSettings } = useConnection();
  const [delegateAddress, setDelegateAddress] = useState("");
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
    <Container
      variant="menu"
      title="Delegate account"
      onBack={() => openSettings(context)}
    >
      <Content>
        <VStack w="full" h="full" justifyContent="space-between" gap={6}>
          <Text color="text.secondary" fontSize="sm">
            Your controller can be owned by an existing Starknet wallet which
            can receive the rewards you earn while playing. <br />
            (This can be updated later)
          </Text>
          <VStack w="full">
            <Input
              w="full"
              // fontSize="10px"
              placeholder="0x..."
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            {!isValid && delegateAddress !== "" && (
              <HStack w="full" color="alert.foreground">
                <AlertIcon />{" "}
                <Text color="alert.foreground">Invalid address!</Text>
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
        {/* <Button w="full" onClick={onClose}>
          Setup later
        </Button> */}
      </Footer>
    </Container>
  );
}
