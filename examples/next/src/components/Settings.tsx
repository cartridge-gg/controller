"use client";

import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";

export function Settings() {
  const { account, connector } = useAccount();
  const cartridgeConnector = connector as unknown as ControllerConnector;

  const onOpenSettings = async () => {
    if (!account) return;
    cartridgeConnector.controller.openSettings();
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
