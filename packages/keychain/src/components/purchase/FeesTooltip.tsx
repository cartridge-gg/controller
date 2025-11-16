import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";

export const FeesTooltip = ({
  trigger,
  defaultOpen,
  isStripe,
}: {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  isStripe: boolean;
}) => {
  const clientFeePercentage = isStripe ? "8.9%" : "2.5%"; // Combined Stripe + Cartridge or just Cartridge

  return (
    <TooltipProvider>
      <Tooltip defaultOpen={defaultOpen}>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="flex flex-col gap-2 bg-spacer-100 border border-background-150 text-foreground-400 min-w-[240px]"
        >
          <div>Processing Fees:</div>
          <Separator className="bg-background-125" />
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Marketplace Fee:</span>
            <span>0.00%</span>
          </div>
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Creator Royalties:</span>
            <span>0.00%</span>
          </div>
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Client Fee:</span>
            <span>{clientFeePercentage}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
