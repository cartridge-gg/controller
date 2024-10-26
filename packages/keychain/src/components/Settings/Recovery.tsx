import { AlertIcon } from "@cartridge/ui";
import { Button, VStack, Text, HStack, Input } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { useConnection } from "hooks/connection";
import { useCallback, useEffect, useState } from "react";
import { CallData, num } from "starknet";
import { ExecuteCtx } from "utils/connection";

export function Recovery({ onBack }: { onBack: () => void }) {
  const { controller, context, setContext } = useConnection();
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

  const onSetRecovery = useCallback(() => {
    setContext({
      origin: context.origin,
      transactions: [
        {
          contractAddress: controller.address,
          entrypoint: "register_external_owner",
          calldata: CallData.compile([externalOwnerAddress]),
        },
      ],
      type: "execute",
      resolve: context.resolve,
      reject: context.reject,
    } as ExecuteCtx);
  }, [controller, externalOwnerAddress, context, setContext]);

  return (
    <Container
      variant="expanded"
      title="Recovery Account(s)"
      onBack={() => onBack()}
    >
      <Content>
        <VStack w="full" h="full" justifyContent="space-between" gap={6}>
          <Text color="text.secondary" fontSize="sm" align="center">
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
          onClick={() => onSetRecovery()}
          isDisabled={!isValid}
        >
          Add Recovery Account
        </Button>
      </Footer>
    </Container>
  );
}
