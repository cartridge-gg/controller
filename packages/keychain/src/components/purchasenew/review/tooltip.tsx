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
          {isStripe && (
            <div className="flex flex-row justify-between text-foreground-300">
              Stripe Processing Fee: <div>3.9%</div>
            </div>
          )}
          <div className="flex flex-row justify-between text-foreground-300">
            Cartridge Processing Fee: <div>{isStripe ? "5%" : "2.5%"}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
