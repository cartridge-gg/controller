"use client";

import { useAccount } from "@starknet-react/core";
import { useCallback, useState } from "react";
import { ControllerConnector } from "@cartridge/connector";
import { ControllerAccounts } from "@cartridge/controller";
import { Button } from "@cartridge/ui-next";

export function FetchControllers() {
  const { address, connector } = useAccount();
  const [error, setError] = useState<Error>();
  const [controllers, setControllers] = useState<ControllerAccounts>();
  const cartridgeConnector = connector as never as ControllerConnector;

  const onFetch = useCallback(async () => {
    if (!address) {
      return;
    }

    setError(undefined);
    try {
      const controllers = await cartridgeConnector.controller.fetchControllers([
        address,
      ]);
      setControllers(controllers);
    } catch (e) {
      setError(e as Error);
    }
  }, [address, cartridgeConnector]);

  if (!address) {
    return <></>;
  }

  return (
    <>
      <div>
        List of Controllers
        {controllers &&
          Object.entries(controllers).map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
        {error && error.message}
        <br />
        <Button onClick={() => onFetch()}>Fetch Controllers</Button>
      </div>
    </>
  );
}
