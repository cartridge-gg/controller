import { Circle, HStack, Text } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { useMemo } from "react";
import { constants } from "starknet";

export function NetworkButton() {
  const { controller, chainName, chainId } = useConnection();

  const bg = useMemo(() => {
    switch (chainId) {
      case constants.StarknetChainId.SN_MAIN:
        return "#A7E7A7";
      default:
      case constants.StarknetChainId.SN_SEPOLIA:
        return "#73C4FF";
    }
  }, [chainId]);

  if (!chainName) {
    return;
  }

  return (
    <HStack bg="solid.bg" borderRadius="base" p={3}>
      <Circle bg={bg} opacity={controller ? 1 : 0.3} size={2} />
      <Text
        fontSize="xs"
        fontWeight={600}
        textTransform={chainName.startsWith("0x") ? "initial" : "uppercase"}
      >
        {chainName}
      </Text>
    </HStack>
  );
}
