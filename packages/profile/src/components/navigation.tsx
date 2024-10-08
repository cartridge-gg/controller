import {
  ClockIcon,
  cn,
  CoinsIcon,
  StateIconProps,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui-next";
import { ProfileContextTypeVariant } from "@cartridge/controller";
import { useConnection } from "./provider/hooks";
import { useCallback } from "react";

export function Navigation() {
  return (
    <div className="flex rounded border border-1 border-secondary overflow-hidden shrink-0">
      <Item Icon={CoinsIcon} variant="inventory" />
      {/* <Item Icon={ScrollIcon} variant="quest" /> */}
      <Item Icon={ClockIcon} variant="history" />
    </div>
  );
}

function Item({
  Icon,
  variant,
}: {
  Icon: React.ComponentType<StateIconProps>;
  variant: ProfileContextTypeVariant;
}) {
  const { context, setContext } = useConnection();

  const onClick = useCallback(() => {
    setContext({ type: variant });
  }, [variant, setContext]);

  if (!context) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "px-4 py-3 cursor-pointer hover:opacity-[0.8]",
              context.type === variant ? "bg-secondary" : "bg-background",
            )}
            onClick={onClick}
          >
            <Icon
              size="sm"
              variant={context.type === variant ? "solid" : "line"}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="capitalize">{variant}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
