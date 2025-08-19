"use client";

import { useAccount, useNetwork } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";
import { useEffect, useState } from "react";
import { constants, num } from "starknet";

export const Starterpack = () => {
  const { account, connector } = useAccount();
  const [purchaseSpId, setPurchaseSpId] = useState<string | null>(null);
  const [claimSpId, setClaimSpId] = useState<string | null>(null);
  const { chain } = useNetwork();

  const controllerConnector = connector as unknown as ControllerConnector;

  useEffect(() => {
    if (!account) {
      return;
    }

    if (num.toHex(chain.id) === constants.StarknetChainId.SN_MAIN) {
      setPurchaseSpId("sick-starterpack-mainnet");
      setClaimSpId("claim-starterpack-mainnet");
    } else {
      setPurchaseSpId("sick-starterpack-sepolia");
      setClaimSpId("claim-starterpack-sepolia");
    }
  }, [chain, account]);

  if (!account || !purchaseSpId || !claimSpId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2>Starterpacks</h2>
      <div className="flex flex-row gap-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              controllerConnector.controller.openStarterPack(purchaseSpId);
            }}
          >
            Purchase Starterpack
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              controllerConnector.controller.openStarterPack(claimSpId);
            }}
          >
            Claim Starterpack
          </Button>
        </div>
      </div>
    </div>
  );
};
