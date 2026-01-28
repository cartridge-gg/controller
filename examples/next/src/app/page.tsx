"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";

const Home: FC = () => {
  const { status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isControllerReady, setIsControllerReady] = useState(false);

  const controllerConnector = useMemo(
    () => ControllerConnector.fromConnectors(connectors),
    [connectors],
  );

  useEffect(() => {
    const checkReady = () => {
      try {
        if (controllerConnector) {
          setIsControllerReady(controllerConnector.isReady());
        }
      } catch (e) {
        console.error("Error checking controller readiness:", e);
      }
    };

    checkReady();
    const interval = setInterval(checkReady, 1000);
    return () => clearInterval(interval);
  }, [controllerConnector]);

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      {status !== "connected" ? (
        <Button
          onClick={() => connect({ connector: controllerConnector })}
          disabled={!isControllerReady}
        >
          {isControllerReady ? "Connect" : "Waiting for keychain..."}
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={() => {
              controllerConnector.controller.openStarterPack(47);
            }}
          >
            Purchase Starterpack
          </Button>
          <Button
            variant="outline"
            onClick={() => disconnect()}
            className="mt-4"
          >
            Disconnect
          </Button>
        </div>
      )}
    </main>
  );
};

export default Home;
