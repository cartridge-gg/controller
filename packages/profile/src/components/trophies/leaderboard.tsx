import {
  cn,
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
    <div className="flex flex-col gap-y-px rounded-md overflow-hidden">
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
    <Link className="flex" to={path}>
      {self && <div className="w-[4px] bg-muted" />}
      <div
        className={cn(
          "grow flex justify-between items-center px-3 py-2 text-sm gap-x-3",
          self ? "bg-quaternary" : "bg-secondary",
        )}
      >
        <div className="flex items-center justify-between grow">
          <div className="flex items-center gap-x-4">
            <p className="text-muted-foreground min-w-6">{`${rank}.`}</p>
            <User
              username={!username ? address.slice(0, 9) : username}
              self={self}
              Icon={SpaceInvaderIcon}
            />
          </div>
          <Trophies trophies={trophies} />
        </div>
        <Earnings earnings={earnings} self={self} />
      </div>
    </Link>
  );
}

function User({
  username,
  self,
  Icon,
}: {
  username: string;
  self: boolean;
  Icon: React.ComponentType<StateIconProps>;
}) {
  return (
    <div className="flex items-center gap-x-2">
      <Icon className="shrink-0" size="default" variant="line" />
      <p className="text-ellipsis line-clamp-1 break-all">
        {self ? `${username} (you)` : username}
      </p>
    </div>
  );
}

function Trophies({
  trophies,
}: {
  trophies: { address: string; id: string; icon: string }[];
}) {
  return (
    <div className="flex items-center gap-x-2 text-primary">
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
