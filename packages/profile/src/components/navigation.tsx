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
  const { username } = useAccount();
  const match = useMatch(`/account/:username/${variant}`);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className={cn(
              "px-4 py-3 cursor-pointer hover:opacity-[0.8]",
              match ? "bg-secondary" : "bg-background",
            )}
            to={`/account/${username}/${variant}`}
          >
            <Icon size="sm" variant={match ? "solid" : "line"} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{variant}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
