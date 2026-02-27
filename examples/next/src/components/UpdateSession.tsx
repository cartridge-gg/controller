"use client";

import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";
import { useState } from "react";

export const UpdateSession = () => {
  const { account, connector } = useAccount();
  const [loading, setLoading] = useState(false);

  const controllerConnector = connector as unknown as ControllerConnector;

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2>Update Session</h2>
      <div className="flex items-center gap-2">
        <Button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              const response =
                await controllerConnector.controller.updateSession({
                  preset: "loot-survivor",
                });
              console.log("Session updated:", response);
            } catch (e) {
              console.error("Failed to update session:", e);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Updating..." : "Update Session (loot-survivor)"}
        </Button>
      </div>
    </div>
  );
};
