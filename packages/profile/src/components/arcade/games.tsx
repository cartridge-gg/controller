import { JoystickIcon, ScrollArea, SparklesIcon, cn } from "@cartridge/ui-next";
import { data } from "./data";
import { useState } from "react";

export const Games = () => {
  const [selected, setSelected] = useState(4);
  return (
    <div className="flex flex-col gap-y-px w-[324px] rounded-lg overflow-hidden">
      <Game
        game={{
          icon: "",
          name: "All",
          slot: "",
          namespace: "",
          points: data.games.reduce((acc, game) => acc + game.points, 0),
        }}
        active={selected === 0}
        onClick={() => setSelected(0)}
      />
      <ScrollArea className="overflow-auto">
        {data.games.map((game, index) => (
          <Game
            key={game.name}
            game={game}
            active={selected === index + 1}
            onClick={() => setSelected(index + 1)}
          />
        ))}
      </ScrollArea>
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
      <GamePoints points={game.points} />
    </div>
  );
};

export const GameIcon = ({ name, icon }: { name: string; icon: string }) => {
  const [imageError, setImageError] = useState(false);
  return imageError ? (
    <JoystickIcon className="h-5 w-5" size="xs" variant="solid" />
  ) : (
    <img
      src={icon}
      alt={name}
      className="h-7 w-7 object-contain"
      onError={() => setImageError(true)}
    />
  );
};

export const GamePoints = ({ points }: { points: number }) => {
  if (points === 0) return null;
  return (
    <div className="flex justify-between items-center gap-x-2 px-2 py-1.5 text-accent-foreground text-md">
      <SparklesIcon className="h-5 w-5" size={"xs"} variant="line" />
      <p className="text-sm">{points}</p>
    </div>
  );
};
