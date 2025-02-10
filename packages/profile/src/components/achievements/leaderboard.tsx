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
import { addAddressPadding } from "starknet";

export function Leaderboard({
  players,
  address,
  achievements,
  pins,
}: {
  players: Player[];
  address: string;
  achievements: Item[];
  pins: { [playerId: string]: string[] };
}) {
  return (
    <div className="flex flex-col gap-y-px">
      {players.map((player, index) => (
        <Row
          key={player.address}
          self={BigInt(player.address || 0) === BigInt(address || 1)}
          address={player.address}
          earnings={player.earnings}
          completeds={player.completeds}
          achievements={achievements}
          rank={index + 1}
          pins={pins}
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
  pins,
}: {
  self: boolean;
  address: string;
  earnings: number;
  rank: number;
  completeds: string[];
  achievements: Item[];
  pins: { [playerId: string]: string[] };
}) {
  const { username } = useUsername({ address });
  const location = useLocation();

  const path = useMemo(() => {
    if (self) return location.pathname;
    return [...location.pathname.split("/"), address].join("/");
  }, [location.pathname, address, self]);

  const trophies = useMemo(() => {
    const ids = (address ? pins[addAddressPadding(address)] : []) || [];
    const pinneds = achievements
      .filter((achievement) => completeds.includes(achievement.id))
      .filter((item) => ids.includes(item.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    return pinneds
      .filter((achievement) => achievement)
      .map((achievement) => ({
        address,
        id: achievement.id,
        icon: achievement.icon,
      }));
  }, [achievements, completeds, address, pins]);

  return (
    <Link
      className={cn("flex w-full", self && "sticky top-0 bottom-0 z-10")}
      to={path}
    >
      <div
        className={cn(
          "grow flex justify-between items-center px-3 py-2 text-sm gap-x-3 sticky top-0 bg-background-200 hover:bg-background-300",
          self && "bg-background-300 text-primary",
        )}
      >
        <div className="flex items-center justify-between grow sticky top-0 gap-x-3">
          <div className="flex items-center gap-x-4 sticky top-0">
            <p className="text-foreground-400 min-w-6 sticky top-0">{`${rank}.`}</p>
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
            self ? "border-background-400" : "border-background-300",
          )}
        >
          <div className={cn("w-4 h-4", trophy.icon, "fa-solid")} />
        </div>
      ))}
      {Array.from({ length: 3 - trophies.length }).map((_, index) => (
        <Empty self={self} key={index} />
      ))}
    </div>
  );
}

function Empty({ self }: { self: boolean }) {
  return (
    <div
      className={cn(
        "w-6 h-6 border rounded-md flex items-center justify-center text-background-500",
        self
          ? "border-background-400 text-foreground-400"
          : "border-background-300 text-background-500",
      )}
    >
      <div className="w-4 h-4 fa-spider-web fa-thin" />
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
