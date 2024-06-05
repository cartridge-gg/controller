import { Policy } from "@cartridge/controller";
import { CodeUtilIcon } from "@cartridge/ui";
import { HStack, Spacer, SystemProps, Text } from "@chakra-ui/react";

export function Call({
  chainId,
  policy,
  ...rest
}: {
  chainId: string;
  policy: Policy;
} & SystemProps) {
  return (
    <HStack w="full" py={2} px={3} {...rest}>
      <CodeUtilIcon boxSize={4} />
      <Text fontSize="sm">{policy.method}</Text>
      <Spacer />
    </HStack>
  );
}
