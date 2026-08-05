"use client";

import { useAccount } from "@starknet-start/react";
import { controllerConnector } from "./providers/StarknetProvider";
import { Button } from "@cartridge/controller-ui";

export function Settings() {
  const { address } = useAccount();

  const onOpenSettings = async () => {
    if (!address) return;
    controllerConnector.controller.openSettings();
  };

  if (!address) {
    return null;
  }

  return (
    <div>
      <h2>Open Settings</h2>
      <Button onClick={onOpenSettings}>Open Settings</Button>
    </div>
  );
}
