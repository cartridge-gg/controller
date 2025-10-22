"use client";

import { useConnect } from "@starknet-react/core";
import { useControllerConfig } from "./providers/ControllerConfigProvider";
import { useMemo } from "react";

export function ControllerDebug() {
  const { connectors } = useConnect();
  const { config } = useControllerConfig();

  const connectorInfo = useMemo(() => {
    const controller = connectors.find((c) => c.id === "controller");
    if (!controller) return null;

    return {
      id: controller.id,
      name: controller.name,
      ready: controller.available,
    };
  }, [connectors]);

  if (!connectorInfo) {
    return null;
  }

  return (
    <div className="rounded-xl bg-base-100 p-4 shadow border border-base-300 text-xs font-mono">
      <h3 className="font-bold mb-2">Controller Configuration</h3>
      <div className="space-y-1">
        <div>
          <span className="opacity-60">Preset:</span>{" "}
          <span className="text-primary">{config.preset}</span>
        </div>
        <div>
          <span className="opacity-60">Slot:</span>{" "}
          <span className="text-primary">{config.slot}</span>
        </div>
        <div>
          <span className="opacity-60">Namespace:</span>{" "}
          <span className="text-primary">{config.namespace}</span>
        </div>
        <div>
          <span className="opacity-60">Override Preset Policies:</span>{" "}
          <span className="text-primary">
            {config.shouldOverridePresetPolicies ? "Yes" : "No"}
          </span>
        </div>
        <div>
          <span className="opacity-60">Tokens:</span>{" "}
          <span className="text-primary">{config.tokens.join(", ")}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-base-300">
          <span className="opacity-60">Connector ID:</span>{" "}
          <span className="text-success">{connectorInfo.id}</span>
        </div>
      </div>
    </div>
  );
}
