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
} from "@cartridge/ui";
import { ProfileContextTypeVariant } from "@cartridge/controller";
import { Link, useMatch, useParams } from "react-router-dom";
import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/context";

export function Navigation() {
  const { project } = useParams<{ project?: string }>();
  const { namespace } = useConnection();
  return (
    <div className="flex rounded border border-1 border-background-100 overflow-hidden shrink-0 gap-px bg-background-100">
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className={cn(
              "px-4 py-3 cursor-pointer hover:opacity-[0.8]",
              isActive ? "bg-background-100" : "bg-background",
            )}
            to={
              project
                ? `/account/${username}/slot/${project}/${variant}`
                : `/account/${username}/${variant}`
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
