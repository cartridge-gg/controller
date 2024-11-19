import {
  cn,
  ScrollArea,
  SpaceInvaderIcon,
  SparklesIcon,
  StateIconProps,
} from "@cartridge/ui-next";
import { Link, useLocation } from "react-router-dom";
import { Item, Player } from "@/hooks/achievements";
import { useUsername } from "@/hooks/account";
import { useMemo } from "react";

export function Leaderboard({
  players,
  address,
  achievements,
}: {
  players: Player[];
  address: string;
  achievements: Item[];
}) {
  return (
    <div className="flex flex-col gap-y-px rounded-md overflow-hidden relative">
      <ScrollArea className="overflow-auto">
        {players.map((player, index) => (
          <Row
            key={player.address}
            self={BigInt(player.address || 0) === BigInt(address || 1)}
            address={player.address}
            earnings={player.earnings}
            completeds={player.completeds}
            achievements={achievements}
            rank={index + 1}
          />
        ))}
      </ScrollArea>
    </div>
  );
}

function Row({
  self,
  address,
  earnings,
  rank,
  completeds,
  achievements,
}: {
  self: boolean;
  address: string;
  earnings: number;
  rank: number;
  completeds: string[];
  achievements: Item[];
}) {
  const { username } = useUsername({ address });
  const location = useLocation();

  const path = useMemo(() => {
    if (self) return location.pathname;
    return [...location.pathname.split("/"), address].join("/");
  }, [location.pathname, address, self]);

  const trophies = useMemo(() => {
    const data = achievements.filter((achievement) =>
      completeds.includes(achievement.id),
    );
    const tops = data
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3);
    return tops
      .filter((achievement) => achievement)
      .map((achievement) => ({
        address,
        id: achievement.id,
        icon: achievement.icon,
      }));
  }, [achievements, completeds, address]);

  return (
    <Link
      className={cn("flex", self && "sticky top-0 bottom-0 z-10")}
      to={path}
    >
      <div
        className={cn(
          "grow flex justify-between items-center px-3 py-2 text-sm gap-x-3 sticky top-0 bg-secondary hover:bg-quaternary",
          self && "bg-quaternary text-primary",
        )}
      >
        <div className="flex items-center justify-between grow sticky top-0 gap-x-3">
          <div className="flex items-center gap-x-4 sticky top-0">
            <p className="text-muted-foreground min-w-6 sticky top-0">{`${rank}.`}</p>
            <User
              username={!username ? address.slice(0, 9) : username}
              Icon={SpaceInvaderIcon}
            />
          </div>
          <Trophies self={self} trophies={trophies} />
        </div>
        <Earnings earnings={earnings} self={self} />
      </div>
    </Link>
  );
}

function User({
  username,
  Icon,
}: {
  username: string;
  Icon: React.ComponentType<StateIconProps>;
}) {
  return (
    <div className="flex items-center gap-x-2">
      <Icon className="shrink-0" size="default" variant="line" />
      <p className="text-ellipsis line-clamp-1 break-all">{username}</p>
    </div>
  );
}

function Trophies({
  self,
  trophies,
}: {
  self: boolean;
  trophies: { address: string; id: string; icon: string }[];
}) {
  return (
    <div className="flex items-center gap-x-2">
      {trophies.map((trophy) => (
        <div
          key={`${trophy.address}-${trophy.id}`}
          className={cn(
            "w-6 h-6 border rounded-md flex items-center justify-center",
            self ? "border-quinary" : "border-quaternary",
          )}
        >
          <div className={cn("w-4 h-4", trophy.icon, "fa-solid")} />
        </div>
      ))}
    </div>
  );
}

function Earnings({ earnings, self }: { earnings: number; self: boolean }) {
  return (
    <div className="flex items-center justify-end gap-x-2 min-w-16">
      <SparklesIcon size="default" variant={self ? "solid" : "line"} />
      <p>{earnings}</p>
    </div>
  );
}
