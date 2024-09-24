"use client";

import { useAccount, useDisconnect } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import { Button } from "@cartridge/ui-next";

export function Settings() {
  const { account, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const cartridgeConnector = connector as unknown as CartridgeConnector;

  const onOpenSettings = async () => {
    if (!account) return;
    const isConnected = await cartridgeConnector.controller.openSettings();
    if (!isConnected) {
      disconnect();
    }
  };

  if (!account) {
    return null;
  }

  return (
    <div>
      <h2>Open Settings</h2>
      <Button onClick={onOpenSettings}>Open Settings</Button>
    </div>
  );
}
