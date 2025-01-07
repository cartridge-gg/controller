import { AlertIcon, Button, Input } from "@cartridge/ui-next";
import { VStack, Text, HStack } from "@chakra-ui/react";
import { Container, Content, Footer } from "@/components/layout";
import { useConnection } from "@/hooks/connection";
import { useCallback, useEffect, useState } from "react";
import { CallData, num } from "starknet";
import { ExecuteCtx } from "@/utils/connection";

export function Delegate({ onBack }: { onBack: () => void }) {
  const { controller, context, setContext } = useConnection();
  const [delegateAddress, setDelegateAddress] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      CallData.compile([delegateAddress]);
      setIsValid(num.isHex(delegateAddress));
    } catch {
      setIsValid(false);
    }
  }, [delegateAddress]);

  const onSetDelegate = useCallback(() => {
    if (!context || !controller) return;
    setContext({
      origin: context.origin,
      transactions: [
        {
          contractAddress: controller.address,
          entrypoint: "set_delegate_account",
          calldata: CallData.compile([delegateAddress]),
        },
      ],
      type: "execute",
      resolve: context.resolve,
      reject: context.reject,
    } as ExecuteCtx);
  }, [controller, delegateAddress, context, setContext]);

  return (
    <Container
      variant="expanded"
      title="Delegate account"
      onBack={() => onBack()}
    >
      <Content>
        <VStack w="full" h="full" justifyContent="space-between" gap={6}>
          <Text color="text.secondary" fontSize="sm" align="center">
            Your controller can be owned by an existing Starknet wallet which
            can receive the rewards you earn while playing. <br />
            (This can be updated later)
          </Text>
          <VStack w="full">
            <Input
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
        <Button onClick={onSetDelegate} disabled={!isValid}>
          Set delegate account
        </Button>
        {/* <Button variant="secondary" onClick={onClose}>
          Setup later
        </Button> */}
      </Footer>
    </Container>
  );
}
