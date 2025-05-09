import {
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./primitives";
import { hexToString, Hex } from "viem";
import { SlotIcon, StarknetColorIcon, StarknetIcon } from "./icons";
import { QuestionIcon } from "./icons/utility/question";
import { constants } from "starknet";
import { getChainName, isSlotChain } from "@cartridge/ui/utils";
import { useCallback } from "react";
import { toast } from "sonner";

export function Network({ chainId }: { chainId: string }) {
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(chainId);
    toast.success("Chain ID copied");
  }, [chainId]);

  if (!chainId) {
    return <Skeleton className="h-[40px] w-[120px] rounded" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            className="flex items-center gap-2 font-inter bg-background hover:bg-background text-xs"
            onClick={onCopy}
          >
            {(() => {
              switch (chainId) {
                case constants.StarknetChainId.SN_MAIN:
                  return <StarknetColorIcon />;
                case constants.StarknetChainId.SN_SEPOLIA:
                  return <StarknetIcon />;
                default:
                  return isSlotChain(chainId) ? <SlotIcon /> : <QuestionIcon />;
              }
            })()}
            <div>{getChainName(chainId)}</div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div>{hexToString(chainId as Hex)}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
