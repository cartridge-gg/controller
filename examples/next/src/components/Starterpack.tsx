"use client";

import { useAccount, useNetwork } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";
import { useEffect, useState } from "react";
import { constants, num } from "starknet";
import { StarterPack } from "@cartridge/controller";

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

  const customStarterPack: StarterPack = {
    name: "Warrior Starter Pack",
    description: "Everything you need to start your adventure",
    iconURL: "https://example.com/warrior-pack.png",
    items: [
      {
        type: "NONFUNGIBLE",
        name: "Legendary Sword",
        description: "A powerful starting weapon",
        iconURL: "https://example.com/sword.png",
        amount: 1,
        price: 50,
        call: [
          {
            to: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            selector: "mint",
            calldata: [account?.address || "0x0", "1", "0"],
          },
        ],
      },
      {
        type: "FUNGIBLE",
        name: "Gold Coins",
        description: "In-game currency",
        iconURL: "https://example.com/gold.png",
        amount: 1000,
        price: 0.01,
        call: [
          {
            to: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            selector: "transfer",
            calldata: [account?.address || "0x0", "1000", "0"],
          },
        ],
      },
      {
        type: "FUNGIBLE",
        name: "Health Potions",
        description: "Restore health",
        amount: 5,
        price: 10,
        call: [
          {
            to: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            selector: "transfer",
            calldata: [account?.address || "0x0", "5", "0"],
          },
        ],
      },
    ],
  };

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
            Purchase Starterpack (Backend)
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              controllerConnector.controller.openStarterPack(claimSpId);
            }}
          >
            Claim Starterpack (Backend)
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              controllerConnector.controller.openStarterPack({
                starterpackId: "custom-warrior-pack",
                starterPack: customStarterPack,
                outsideExecutionConfig: {
                  executeBefore: Math.floor(Date.now() / 1000) + 3600, // 1 hour
                },
              });
            }}
          >
            Custom Warrior Pack ($110)
          </Button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          Custom Starter Pack Example
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          This example shows how to create a custom starter pack with outside
          execution:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>
            <strong>Legendary Sword</strong> (NFT): $50 - Mints a unique weapon
          </li>
          <li>
            <strong>Gold Coins</strong> (Fungible): $10 (1000 × $0.01) - In-game
            currency
          </li>
          <li>
            <strong>Health Potions</strong> (Fungible): $50 (5 × $10) -
            Consumable items
          </li>
        </ul>
        <p className="text-sm font-semibold mt-2">Total: $110</p>
        <p className="text-xs text-gray-500 mt-1">
          All contract calls will be executed via outside execution after
          payment
        </p>
      </div>
    </div>
  );
};
