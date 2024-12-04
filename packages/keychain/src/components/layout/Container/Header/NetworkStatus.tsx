import { StarknetColorIcon, StarknetIcon, SlotIcon } from "@cartridge/ui";
import { QuestionIcon } from "@cartridge/ui";
import { Button, Circle, Tooltip } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import { constants } from "starknet";
import { isSlotChain } from "@cartridge/utils";
import { Hex, hexToString } from "viem";

export function NetworkStatus() {
  const { chainName, chainId } = useConnection();
  const { toast } = useToast();

  if (!chainName) {
    return;
  }

  return (
    <Tooltip
      label={hexToString(chainId as Hex)}
      fontSize="xs"
      bg="solid.bg"
      color="text.primary"
    >
      <Button
        px="12px"
        py="10px"
        bg="solid.bg"
        fontSize="xs"
        fontFamily="Inter"
        _hover={{ bg: "hsl(var(solid.primary)/0.75)" }}
        iconSpacing={1.5}
        leftIcon={
          <Circle size={5}>
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
    </Tooltip>
  );
}
