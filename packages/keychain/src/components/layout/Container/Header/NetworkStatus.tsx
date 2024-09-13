import {
  StarknetColorIcon,
  StarknetIcon,
  SlotIcon,
  AlertIcon,
} from "@cartridge/ui";
import { Button, Circle } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import { constants } from "starknet";
import { isSlotChain } from "utils/network";

export function NetworkStatus() {
  const { chainName, chainId } = useConnection();
  const { toast } = useToast();

  if (!chainName) {
    return;
  }

  return (
    <Button
      size="sm"
      bg="solid.primary"
      fontSize="xs"
      fontFamily="Inter"
      _hover={{ bg: "solid.primary", opacity: 0.7 }}
      leftIcon={
        <Circle size={5} bg="solid.primary">
          {(() => {
            switch (chainId) {
              case constants.StarknetChainId.SN_MAIN:
                return <StarknetColorIcon fontSize="xl" />;
              case constants.StarknetChainId.SN_SEPOLIA:
                return <StarknetIcon fontSize="xl" />;
              default:
                return isSlotChain(chainId) ? (
                  <SlotIcon fontSize="xl" />
                ) : (
                  <AlertIcon fontSize="xl" />
                );
            }
          })()}
        </Circle>
      }
      onClick={() => {
        navigator.clipboard.writeText(chainId);
        toast("Chain ID is copied");
      }}
    >
      {chainName}
    </Button>
  );
}
