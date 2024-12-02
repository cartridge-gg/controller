import {
  ControllerIcon,
  JoystickIcon,
  SpaceInvaderIcon,
  SparklesIcon,
  CopyAddress,
  cn,
} from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { LayoutContent, LayoutHeader } from "../layout";
import { useAccount } from "@/hooks/account";
import { data } from "./data";
import { useState } from "react";

export const Header = () => {
  const { username } = useAccount();

  return (
    <div className="flex justify-between gap-x-px w-full">
      <div className="bg-background h-14 w-14 flex items-center justify-center">
        <ControllerIcon className="h-6 w-6 text-primary" size={"xs"} />
      </div>
      <div className="bg-background flex justify-end items-center grow px-3 py-2">
        <div className="bg-secondary flex items-center px-2 py-1.5 rounded-md">
          <div className="h-7 w-7 flex items-center justify-center">
            <SpaceInvaderIcon className="h-4 w-4" size="xs" variant="solid" />
          </div>
          <p className="text-sm font-semibold px-1">{username || "Connect"}</p>
        </div>
      </div>
    </div>
  );
};

export const Content = () => {
  return (
    <LayoutContent className="flex flex-row justify-between items-center">
      <Games />
      <Container />
    </LayoutContent>
  );
};

export const Player = () => {
  const { username, address } = useAccount();

  return (
    <LayoutHeader
      title={username}
      description={<CopyAddress address={address} size="sm" />}
      right={<Navigation />}
    />
  );
};

export const Games = () => {
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex flex-col gap-y-px w-[324px] rounded-lg overflow-hidden">
      <Game
        game={{
          icon: "",
          name: "All",
          points: data.games.reduce((acc, game) => acc + game.points, 0),
        }}
        active={selected === 0}
        onClick={() => setSelected(0)}
      />
      {data.games.map((game, index) => (
        <Game
          key={game.name}
          game={game}
          active={selected === index + 1}
          onClick={() => setSelected(index + 1)}
        />
      ))}
    </div>
  );
};

export const Game = ({
  game,
  active,
  onClick,
}: {
  game: (typeof data.games)[number];
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center p-2 hover:opacity-[0.8] hover:cursor-pointer",
        active ? "bg-quaternary" : "bg-secondary",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-x-2">
        <div
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-lg",
            active ? "bg-quinary" : "bg-quaternary",
          )}
        >
          <GameIcon name={game.name} icon={game.icon} />
        </div>
        <p className="text-sm">{game.name}</p>
      </div>
      <div className="flex items-center gap-x-2">
        <SparklesIcon className="h-4 w-4" size={"xs"} variant="line" />
        <p className="text-sm">{game.points}</p>
      </div>
    </div>
  );
};

export const GameIcon = ({ name, icon }: { name: string; icon: string }) => {
  const [imageError, setImageError] = useState(false);
  return imageError ? (
    <JoystickIcon className="h-7 w-7" size="xs" variant="solid" />
  ) : (
    <img
      src={icon}
      alt={name}
      className="h-7 w-7 object-contain"
      onError={() => setImageError(true)}
    />
  );
};

export const Container = () => {
  return <div className="">Container</div>;
};

export const Arcade = () => {
  return (
    <div className="bg-spacer flex flex-col items-center gap-y-px select-none">
      <Header />
      <div className="bg-background w-full flex justify-center">
        <div className="w-3/4 flex flex-col py-8 gap-y-8">
          <Player />
          <Content />
        </div>
      </div>
    </div>
  );
};
