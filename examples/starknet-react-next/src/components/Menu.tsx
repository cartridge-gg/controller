"use client";

import { useAccount, useDisconnect } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import { Button } from "@cartridge/ui-next";

export function Menu() {
  const { account, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const cartridgeConnector = connector as unknown as CartridgeConnector;

  const onOpenMenu = async () => {
    if (!account) return;
    const isConnected = await cartridgeConnector.openMenu();
    if (!isConnected) {
      disconnect()
    }
  };

  if (!account) {
    return null;
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <h2>Open Menu</h2>
      <Button onClick={onOpenMenu}>Open Menu</Button>
    </div>
  );
}
