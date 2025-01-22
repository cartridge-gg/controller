"use client";

import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui-next";
import { ETH_CONTRACT_ADDRESS } from "./providers/StarknetProvider";
import { useEffect, useState } from "react";

export function Profile() {
  const { account, connector } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const ctrlConnector = connector as unknown as ControllerConnector;

  useEffect(() => {
    async function fetch() {
      try {
        const name = await (connector as ControllerConnector)?.username();
        if (!name) return;
        setUsername(name);
      } catch (error) {
        console.error(error);
      }
    }
    fetch();
  }, [connector]);

  if (!account) {
    return null;
  }

  return (
    <div className="">
      <h2>Open Profile</h2>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
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
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileTo(
                `inventory/token/${ETH_CONTRACT_ADDRESS}?preset=cartridge`,
              )
            }
          >
            Open to Token ETH
          </Button>
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileTo(
                `inventory/token/${ETH_CONTRACT_ADDRESS}/send?preset=cartridge`,
              )
            }
          >
            Open to Token ETH Send
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileAt(
                `account/${username}/slot/ryomainnet/achievements?ps=ryomainnet&ns=dopewars&preset=dope-wars`,
              )
            }
          >
            Open at Dopewars Achievements
          </Button>
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileAt(
                `account/${username}/slot/darkshuffle-mainnet-3/achievements?ps=darkshuffle-mainnet-3&ns=darkshuffle_s0&preset=dark-shuffle`,
              )
            }
          >
            Open at Dark Shuffle Achievements
          </Button>
        </div>
      </div>
    </div>
  );
}
