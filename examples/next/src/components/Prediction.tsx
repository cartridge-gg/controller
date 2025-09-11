"use client";

import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";

export const Prediction = () => {
  const { account, connector } = useAccount();

  const controllerConnector = connector as unknown as ControllerConnector;

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2>Prediction</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3>Open Prediction</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                controllerConnector.controller.openPrediction();
              }}
            >
              Open Prediction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
