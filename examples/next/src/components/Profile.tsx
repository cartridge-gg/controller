"use client";

import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui-next";

export function Profile() {
  const { account, connector } = useAccount();
  const ctrlConnector = connector as unknown as ControllerConnector;

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Open Profile</h2>
      <div className="flex gap-1">
        <Button onClick={() => ctrlConnector.controller.openProfile()}>
          Inventory
        </Button>
        <Button
          onClick={() => ctrlConnector.controller.openProfile("achievements")}
        >
          Achievements
        </Button>
        <Button
          onClick={() => ctrlConnector.controller.openProfile("trophies")}
        >
          Trophies
        </Button>
        <Button
          onClick={() => ctrlConnector.controller.openProfile("activity")}
        >
          Activity
        </Button>
        <Button
          onClick={() => ctrlConnector.controller.openProfile("arcade")}
        >
          Arcade
        </Button>
      </div>
    </div>
  );
}
