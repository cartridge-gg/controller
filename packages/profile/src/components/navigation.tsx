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
import { Link, useMatch, useParams } from "react-router-dom";
import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/context";
import { useMemo } from "react";

export function Navigation() {
  const { project } = useParams<{ project?: string }>();
  const { namespace } = useConnection();
  return (
    <div className="flex rounded border border-1 border-secondary overflow-hidden shrink-0 gap-[1px] bg-secondary">
      <Item Icon={CoinsIcon} variant="inventory" />
      {project && namespace && (
        <Item Icon={TrophyIcon} variant="achievements" />
      )}
      {project && <Item Icon={ClockIcon} variant="activity" />}
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
  const { project } = useParams<{ project?: string }>();
  const { username } = useAccount();
  const isPublic = useMatch(`/account/:username/${variant}`);
  const isSlot = useMatch(`/account/:username/slot/:project/${variant}`);
  const isActive = project ? isSlot : isPublic;

  const to = useMemo(() => {
    return project
      ? `/account/${username}/slot/${project}/${variant}`
      : `/account/${username}/${variant}`;
  }, [project, username, variant]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className={cn(
              "flex gap-2 px-4 py-3 justify-center items-center cursor-pointer hover:opacity-[0.8]",
              isActive ? "bg-secondary" : "bg-background",
            )}
            to={to}
          >
            <Icon size="sm" variant={isActive ? "solid" : "line"} />
            <p className="capitalize hidden md:block">{variant}</p>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize block md:hidden">{variant}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
