import { JoystickIcon, ScrollArea, SparklesIcon, cn } from "@cartridge/ui-next";
import { data } from "./data";
import { useCallback, useState } from "react";
import { useTheme } from "@/hooks/context";
import {
  ControllerThemePreset,
  defaultPresets as presets,
} from "@cartridge/controller";

export const Games = () => {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-y-px w-[324px] rounded-lg overflow-hidden">
      <Game
        index={0}
        game={{
          id: "all",
          icon: "",
          name: "All",
          slot: "",
          namespace: "",
          points: data.games.reduce((acc, game) => acc + game.points, 0),
        }}
        active={selected === 0}
        setSelected={setSelected}
      />
      <ScrollArea className="overflow-auto">
        {data.games.map((game, index) => (
          <Game
            key={game.id}
            index={index + 1}
            game={game}
            active={selected === index + 1}
            setSelected={setSelected}
          />
        ))}
      </ScrollArea>
    </div>
  );
};

export const Game = ({
  index,
  game,
  active,
  setSelected,
}: {
  index: number;
  game: (typeof data.games)[number];
  active: boolean;
  setSelected: (index: number) => void;
}) => {
  const { theme, setTheme, resetTheme } = useTheme();

  const handleClick = useCallback(() => {
    setSelected(index);
    const preset = presets[game.id.toLowerCase()];
    if (!preset || !preset.colors) {
      return resetTheme();
    }
    const newTheme: ControllerThemePreset = {
      ...theme,
      colors: {
        ...theme.colors,
        primary: preset.colors.primary,
      },
    };
    setTheme(newTheme);
  }, [index, theme, setSelected, setTheme]);

  return (
    <div
      className={cn(
        "flex justify-between items-center p-2 hover:opacity-[0.8] hover:cursor-pointer",
        active ? "bg-quaternary" : "bg-secondary",
      )}
      onClick={handleClick}
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
