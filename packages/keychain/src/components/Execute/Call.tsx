import { Policy } from "@cartridge/controller";
import { CodeSolidIcon } from "@cartridge/ui";
import { HStack, Spacer, SystemProps, Text } from "@chakra-ui/react";
import { constants } from "starknet";

export function Call({
  chainId,
  policy,
  ...rest
}: {
  chainId: constants.StarknetChainId;
  policy: Policy;
} & SystemProps) {
  return (
    <HStack w="full" py={2} px={3} {...rest}>
      <CodeSolidIcon boxSize={4} />
      <Text fontSize="sm">{policy.method}</Text>
      <Spacer />
    </HStack>
  );
}
