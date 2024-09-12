import { StarknetColorIcon, StarknetIcon, SlotIcon } from "@cartridge/ui";
import { Circle, HStack, Text } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { constants } from "starknet";

export function NetworkButton() {
  const { chainName, chainId } = useConnection();

  if (!chainName) {
    return;
  }

  return (
    <HStack bg="solid.bg" borderRadius="base" p={3}>
      <Circle size={5} bg="solid.primary">
        {(() => {
          switch (chainId) {
            case constants.StarknetChainId.SN_MAIN:
              return <StarknetColorIcon fontSize="xl" />;
            case constants.StarknetChainId.SN_SEPOLIA:
              return <StarknetIcon fontSize="xl" />;
            default:
              return <SlotIcon fontSize="xl" />;
          }
        })()}
      </Circle>
      <Text fontSize="xs" fontWeight={600} textTransform="uppercase">
        {chainName}
      </Text>
    </HStack>
  );
}
