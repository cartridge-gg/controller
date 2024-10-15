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
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function Navigation() {
  return (
    <div className="flex rounded border border-1 border-secondary overflow-hidden shrink-0 gap-[1px] bg-secondary">
      <Item Icon={CoinsIcon} variant="inventory" />
      <Item Icon={ClockIcon} variant="history" />
      {/* <Item Icon={ScrollIcon} variant="quest" /> */}
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
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = useCallback(() => {
    navigate(`/${variant}`);
  }, [variant, navigate]);

  const isActive =
    location.pathname == `/${variant}` ||
    (variant === "inventory" && location.pathname === "/");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "px-4 py-3 cursor-pointer hover:opacity-[0.8]",
              isActive ? "bg-secondary" : "bg-background",
            )}
            onClick={onClick}
          >
            <Icon size="sm" variant={isActive ? "solid" : "line"} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{variant}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
