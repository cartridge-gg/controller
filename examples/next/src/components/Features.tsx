"use client";

import { useState } from "react";
import { useAccount } from "@starknet-start/react";
import { Button } from "@cartridge/controller-ui";
import { controllerConnector } from "./providers/StarknetProvider";

const FEATURES = [
  "coinflow-support",
  "coinflow-sandbox",
  "registered-accounts",
  "recovery-accounts",
  "connection-instagram",
  "connection-tiktok",
] as const;

export function Features() {
  const { address } = useAccount();
  const [enabledFeatures, setEnabledFeatures] = useState<
    Record<string, boolean>
  >({});

  const toggleFeature = (feature: string) => {
    const isEnabled = !!enabledFeatures[feature];
    const action = isEnabled ? "disable" : "enable";
    controllerConnector.controller.openProfileAt(
      `/feature/${feature}/${action}`,
    );
    setEnabledFeatures((prev) => ({ ...prev, [feature]: !isEnabled }));
  };

  if (!address) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2>Features</h2>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          {FEATURES.map((feature) => {
            const isEnabled = !!enabledFeatures[feature];
            return (
              <Button
                key={feature}
                variant={isEnabled ? "primary" : "secondary"}
                className="text-xs"
                onClick={() => toggleFeature(feature)}
              >
                {`${isEnabled ? "-" : "+"}${feature}`}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
