"use client";

import { useAccount, useNetwork } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button, Input } from "@cartridge/ui";
import { useState, useEffect, useRef } from "react";
import { constants, num } from "starknet";

export const Starterpack = () => {
  const { account, connector } = useAccount();
  const { chain } = useNetwork();

  const controllerConnector = connector as unknown as ControllerConnector;

  const getDefaultStarterpackIds = () => {
    if (chain && num.toHex(chain.id) === constants.StarknetChainId.SN_MAIN) {
      return {
        purchaseOnchain: 0,
        claim: "claim-dopewars-mainnet",
      };
    }
    return {
      purchaseOnchain: 0,
      claim: "claim-dopewars-sepolia",
    };
  };

  const defaultIds = getDefaultStarterpackIds();
  const [claimSpId, setClaimSpId] = useState<string>(defaultIds.claim);
  const [claimPreimage, setClaimPreimage] = useState<string>("");
  const [purchaseOnchainSpId, setPurchaseOnchainSpId] = useState<number>(
    defaultIds.purchaseOnchain,
  );

  // Track the current expected defaults to detect network changes
  const expectedDefaultsRef = useRef(defaultIds);
  const previousChainRef = useRef(chain);

  // Update defaults when network changes, but only if current values match expected defaults
  useEffect(() => {
    if (!chain || chain === previousChainRef.current) return;

    const newDefaults = getDefaultStarterpackIds();
    const currentExpected = expectedDefaultsRef.current;

    // Only update if the values haven't been manually modified by the user
    setClaimSpId((currentClaimSpId) => {
      return currentClaimSpId === currentExpected.claim
        ? newDefaults.claim
        : currentClaimSpId;
    });

    setPurchaseOnchainSpId((currentPurchaseOnchainSpId) => {
      return currentPurchaseOnchainSpId === currentExpected.purchaseOnchain
        ? newDefaults.purchaseOnchain
        : currentPurchaseOnchainSpId;
    });

    // Update our references after successful comparison and update
    expectedDefaultsRef.current = newDefaults;
    previousChainRef.current = chain;
  }, [chain]);

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2>Starterpacks</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3>Purchase Starterpack</h3>
          <div className="flex items-center gap-2">
            <Input
              className="max-w-80"
              type="text"
              value={purchaseOnchainSpId}
              onChange={(e) => setPurchaseOnchainSpId(Number(e.target.value))}
              placeholder="Enter starterpack ID"
            />
            <Button
              onClick={() => {
                controllerConnector.controller.openStarterPack(
                  purchaseOnchainSpId,
                  {
                    onPurchaseComplete: () => {
                      console.log("Starterpack play callback fired.");
                    },
                  },
                );
              }}
            >
              Purchase
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3>Claim Starterpack</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                className="max-w-80"
                type="text"
                value={claimSpId}
                onChange={(e) => setClaimSpId(e.target.value)}
                placeholder="Enter starterpack ID"
              />
              <Button
                onClick={() => {
                  if (claimSpId.trim()) {
                    controllerConnector.controller.openStarterPack(
                      claimSpId.trim(),
                      {
                        preimage: claimPreimage.trim(),
                      },
                    );
                  }
                }}
              >
                Claim
              </Button>
            </div>
            <Input
              className="max-w-80"
              type="text"
              value={claimPreimage}
              onChange={(e) => setClaimPreimage(e.target.value)}
              placeholder="Optional: Enter preimage"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
