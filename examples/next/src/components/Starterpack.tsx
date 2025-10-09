"use client";

import { useAccount, useNetwork } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button, Input } from "@cartridge/ui";
import { useState, useEffect, useRef } from "react";
import { constants, num } from "starknet";
import { StarterPack, StarterPackItemType } from "@cartridge/controller";

export const Starterpack = () => {
  const { account, connector } = useAccount();
  const { chain } = useNetwork();

  const controllerConnector = connector as unknown as ControllerConnector;

  const getDefaultStarterpackIds = () => {
    if (chain && num.toHex(chain.id) === constants.StarknetChainId.SN_MAIN) {
      return {
        purchase: "ls2-dungeon-ticket-mainnet",
        claim: "pirate-nation-claim-mainnet",
      };
    }
    return {
      purchase: "ls2-dungeon-ticket-sepolia",
      claim: "pirate-nation-claim-sepolia",
    };
  };

  const defaultIds = getDefaultStarterpackIds();
  const [purchaseSpId, setPurchaseSpId] = useState<string>(defaultIds.purchase);
  const [claimSpId, setClaimSpId] = useState<string>(defaultIds.claim);

  // Track the current expected defaults to detect network changes
  const expectedDefaultsRef = useRef(defaultIds);
  const previousChainRef = useRef(chain);

  // Update defaults when network changes, but only if current values match expected defaults
  useEffect(() => {
    if (!chain || chain === previousChainRef.current) return;

    const newDefaults = getDefaultStarterpackIds();
    const currentExpected = expectedDefaultsRef.current;

    // Only update if the values haven't been manually modified by the user
    setPurchaseSpId((currentPurchaseSpId) => {
      return currentPurchaseSpId === currentExpected.purchase
        ? newDefaults.purchase
        : currentPurchaseSpId;
    });

    setClaimSpId((currentClaimSpId) => {
      return currentClaimSpId === currentExpected.claim
        ? newDefaults.claim
        : currentClaimSpId;
    });

    // Update our references after successful comparison and update
    expectedDefaultsRef.current = newDefaults;
    previousChainRef.current = chain;
  }, [chain]);

  if (!account) {
    return null;
  }

  const customStarterPack: StarterPack = {
    name: "Warrior Starter Pack",
    description: "Everything you need to start your adventure",
    iconURL: "https://example.com/warrior-pack.png",
    items: [
      {
        type: StarterPackItemType.NONFUNGIBLE,
        name: "Legendary Sword",
        description: "A powerful starting weapon",
        iconURL: "https://example.com/sword.png",
        amount: 1,
        price: 50000000n,
        call: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "mint",
            calldata: [account?.address || "0x0", "1", "0"],
          },
        ],
      },
      {
        type: StarterPackItemType.FUNGIBLE,
        name: "Gold Coins",
        description: "In-game currency",
        iconURL: "https://example.com/gold.png",
        amount: 1000,
        price: 10000n,
        call: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "transfer",
            calldata: [account?.address || "0x0", "1000", "0"],
          },
        ],
      },
      {
        type: StarterPackItemType.FUNGIBLE,
        name: "Health Potions",
        description: "Restore health",
        iconURL: "https://example.com/potions.png",
        amount: 5,
        price: 10000000n,
        call: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "transfer",
            calldata: [account?.address || "0x0", "5", "0"],
          },
        ],
      },
    ],
  };

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
              value={purchaseSpId}
              onChange={(e) => setPurchaseSpId(e.target.value)}
              placeholder="Enter starterpack ID"
            />
            <Button
              onClick={() => {
                if (purchaseSpId.trim()) {
                  controllerConnector.controller.openStarterPack(
                    purchaseSpId.trim(),
                  );
                }
              }}
              disabled={!purchaseSpId.trim()}
            >
              Purchase Starterpack
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3>Claim Starterpack</h3>
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
                  );
                }
              }}
              disabled={!claimSpId.trim()}
            >
              Claim Starterpack
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3>Custom Starterpack</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                controllerConnector.controller.openStarterPack({
                  items: customStarterPack.items,
                  name: customStarterPack.name,
                  description: customStarterPack.description,
                  iconURL: customStarterPack.iconURL,
                });
              }}
            >
              Custom Warrior Pack ($110)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
