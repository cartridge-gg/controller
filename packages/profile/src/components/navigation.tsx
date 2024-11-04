import {
  ClockIcon,
  cn,
  CoinsIcon,
  StateIconProps,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TrophyIcon,
} from "@cartridge/ui-next";
import { ProfileContextTypeVariant } from "@cartridge/controller";
import { Link, useMatch } from "react-router-dom";
import { useAccount } from "@/hooks/account";

export function Navigation() {
  return (
    <div className="flex rounded border border-1 border-secondary overflow-hidden shrink-0 gap-[1px] bg-secondary">
      <Item Icon={CoinsIcon} variant="inventory" />
      <Item Icon={TrophyIcon} variant="trophies" />
      <Item Icon={ClockIcon} variant="activity" />
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
  const { username, namespace } = useAccount();
  const isPublic = useMatch(`/account/:username/${variant}`);
  const isSlot = useMatch(`/account/:username/slot/:project/${variant}`);
  const isActive = namespace ? isSlot : isPublic;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className={cn(
              "px-4 py-3 cursor-pointer hover:opacity-[0.8]",
              isActive ? "bg-secondary" : "bg-background",
            )}
            to={
              namespace
                ? `/account/${username}/${variant}`
                : `/account/${username}/slot/${namespace}/${variant}`
            }
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
