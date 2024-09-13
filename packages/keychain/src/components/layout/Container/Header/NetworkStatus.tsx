import { StarknetColorIcon, StarknetIcon, SlotIcon } from "@cartridge/ui";
import { QuestionIcon } from "@cartridge/ui/src/components/icons/utility/Question";
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
      iconSpacing={1.5}
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
                  <QuestionIcon fontSize="xl" />
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
