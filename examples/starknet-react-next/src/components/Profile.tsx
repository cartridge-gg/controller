"use client";

import { useAccount } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import { Button } from "@cartridge/ui-next";

export function Profile() {
  const { account, connector } = useAccount();
  const cartridgeConnector = connector as unknown as CartridgeConnector;

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Open Menu</h2>
      <Button onClick={() => cartridgeConnector.openProfile()}>
        Open Profile
      </Button>
    </div>
  );
}
