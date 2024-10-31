import {
  cn,
  SpaceInvaderIcon,
  SparklesIcon,
  StateIconProps,
} from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import { Player } from "@/hooks/achievements";
import { useUsername } from "@/hooks/account";

export function Leaderboard({
  players,
  address,
}: {
  players: Player[];
  address: string;
}) {
  return (
    <div className="flex flex-col gap-y-px rounded-md overflow-hidden">
      {players.map((player, index) => (
        <Row
          key={player.address}
          self={BigInt(player.address || 0) === BigInt(address || 1)}
          address={player.address}
          earnings={player.earnings}
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
}: {
  self: boolean;
  address: string;
  earnings: number;
  rank: number;
}) {
  const { username } = useUsername({ address });

  return (
    <Link className="flex" to={`/trophies/${address}`} key={address}>
      {self && <div className="w-[4px] bg-muted" />}
      <div
        className={cn(
          "grow flex justify-between items-center px-3 py-2 text-sm",
          self ? "bg-quaternary" : "bg-secondary",
        )}
      >
        <div className="flex items-center gap-x-4">
          <p className="text-muted-foreground w-6">{`${rank}.`}</p>
          <User
            username={!username ? address.slice(0, 9) : username}
            self={self}
            Icon={SpaceInvaderIcon}
          />
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
      <Icon size="default" variant="line" />
      <p>{self ? `${username} (you)` : username}</p>
    </div>
  );
}

function Earnings({ earnings, self }: { earnings: number; self: boolean }) {
  return (
    <div className="flex items-center gap-x-2">
      <SparklesIcon size="default" variant={self ? "solid" : "line"} />
      <p>{earnings}</p>
    </div>
  );
}
