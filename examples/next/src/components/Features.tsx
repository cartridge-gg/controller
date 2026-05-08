"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Button } from "@cartridge/controller-ui";
import ControllerConnector from "@cartridge/connector/controller";

const FEATURES = [
  "coinflow-support",
  "sms",
  "registered-accounts",
  "recovery-accounts",
  "connection-instagram",
  "connection-tiktok",
] as const;

export function Features() {
  const { account, connector } = useAccount();
  const ctrlConnector = connector as unknown as ControllerConnector;
  const [enabledFeatures, setEnabledFeatures] = useState<
    Record<string, boolean>
  >({});

  const toggleFeature = (feature: string) => {
    const isEnabled = !!enabledFeatures[feature];
    const action = isEnabled ? "disable" : "enable";
    ctrlConnector.controller.openProfileAt(`/feature/${feature}/${action}`);
    setEnabledFeatures((prev) => ({ ...prev, [feature]: !isEnabled }));
  };

  if (!account) {
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
