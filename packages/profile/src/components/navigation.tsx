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
import { Link, useLocation } from "react-router-dom";

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
  const location = useLocation();

  const isActive =
    location.pathname == `/${variant}` ||
    (variant === "inventory" && location.pathname === "/");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className={cn(
              "px-4 py-3 cursor-pointer hover:opacity-[0.8]",
              isActive ? "bg-secondary" : "bg-background",
            )}
            to={`/${variant}`}
          >
            <Icon size="sm" variant={isActive ? "solid" : "line"} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{variant}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
