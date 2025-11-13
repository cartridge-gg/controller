"use client";

import { Button } from "@cartridge/ui";
import ControllerConnector from "@cartridge/connector/controller";
import { useConnect } from "@starknet-react/core";
import { useMemo, useState } from "react";

interface Game {
  name: string;
  url: string;
  description: string;
}

const GAMES: Game[] = [
  {
    name: "Loot Survivor",
    url: "https://lootsurvivor.io?controller_redirect",
    description: "Survive the adventure, earn rewards",
  },
  {
    name: "Nums",
    url: "https://nums-blond.vercel.app?controller_redirect",
    description: "Survive the adventure, earn rewards",
  },
];

export const PlayButton = () => {
  const { connectors } = useConnect();
  const [isChecking, setIsChecking] = useState(false);
  const controllerConnector = useMemo(
    () => ControllerConnector.fromConnectors(connectors),
    [connectors],
  );

  const handlePlayGame = async (game: Game) => {
    if (!controllerConnector) {
      console.error("Controller connector not available");
      return;
    }

    setIsChecking(true);
    try {
      // Check if we have first-party storage access
      const hasAccess =
        await controllerConnector.controller.hasFirstPartyAccess();

      if (!hasAccess) {
        // Redirect through standalone auth first to establish first-party storage
        controllerConnector.controller.open({
          redirectUrl: game.url,
        });
      } else {
        // Direct navigation - user already authenticated via standalone
        window.location.href = game.url;
      }
    } catch (error) {
      console.error("Error checking storage access:", error);
      // Fallback: try direct navigation
      window.location.href = game.url;
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-6 bg-surface">
      <h2 className="text-2xl font-bold mb-4">Play Games</h2>
      <p className="text-muted mb-6">
        Launch games with your Cartridge controller. First-time users will be
        redirected through standalone authentication to enable seamless login
        across all games.
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
            <Button
              onClick={() => handlePlayGame(game)}
              disabled={isChecking}
              className="ml-4"
            >
              {isChecking ? "Checking..." : "Play"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
