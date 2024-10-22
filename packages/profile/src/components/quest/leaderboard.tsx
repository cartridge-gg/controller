import {
  cn,
  SpaceInvaderIcon,
  SparklesIcon,
  StateIconProps,
} from "@cartridge/ui-next";
import { Player } from ".";

export function Leaderboard({
  players,
  address,
}: {
  players: Player[];
  address: string;
}) {
  return (
    <div className="flex flex-col gap-y-px rounded-md overflow-hidden mb-2">
      {players
        .sort((a, b) => a.rank - b.rank)
        .map((player) => (
          <Row
            key={player.address}
            self={BigInt(player.address || 0) === BigInt(address || 1)}
            {...player}
          />
        ))}
    </div>
  );
}

function Row({
  self,
  username,
  earnings,
  rank,
  Icon,
}: Player & { self: boolean }) {
  return (
    <div className="flex">
      {self && <div className="w-[4px] bg-muted" />}
      <div
        className={cn(
          "grow flex justify-between items-center px-3 py-2 text-sm",
          self ? "bg-muted/50" : "bg-secondary",
        )}
      >
        <div className="flex items-center gap-x-4">
          <p className="text-muted-foreground w-6">{`${rank}.`}</p>
          <User username={username} self={self} Icon={Icon} />
        </div>
        <Earnings earnings={earnings} self={self} />
      </div>
    </div>
  );
}

function User({
  username,
  self,
  Icon,
}: {
  username: string;
  self: boolean;
  Icon: React.ComponentType<StateIconProps> | undefined;
}) {
  return (
    <div className="flex items-center gap-x-2">
      {!!Icon && <Icon size="default" variant="line" />}
      {!Icon && <SpaceInvaderIcon size="default" variant="line" />}
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
