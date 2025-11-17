"use client";

import { Button } from "@cartridge/ui";
import ControllerConnector from "@cartridge/connector/controller";
import { useConnect } from "@starknet-react/core";
import { useMemo } from "react";

interface Game {
  name: string;
  url: string;
  description: string;
}

const GAMES: Game[] = [
  {
    name: "Loot Survivor",
    url: `${process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL}?redirect_url=https://lootsurvivor.io&preset=loot-survivor`,
    description: "Survive the adventure, earn rewards",
  },
  {
    name: "Nums",
    url: `${process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL}?redirect_url=https://nums-blond.vercel.app&preset=nums`,
    description: "Survive the adventure, earn rewards",
  },
];

export const PlayButton = () => {
  const { connectors } = useConnect();
  const controllerConnector = useMemo(
    () => ControllerConnector.fromConnectors(connectors),
    [connectors],
  );

  const handlePlayGame = async (game: Game) => {
    if (!controllerConnector) {
      console.error("Controller connector not available");
      return;
    }

    window.location.href = game.url;
  };

  return (
    <div className="border border-border rounded-lg p-6 bg-surface">
      <h2 className="text-2xl font-bold mb-4">Play Games</h2>
      <p className="text-muted mb-6">
        Launch games with your Cartridge controller.
      </p>
      <div className="grid gap-4">
        {GAMES.map((game) => (
          <div
            key={game.url}
            className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-surface-hover transition-colors"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{game.name}</h3>
              <p className="text-sm text-muted">{game.description}</p>
            </div>
            <Button onClick={() => handlePlayGame(game)} className="ml-4">
              Play
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
