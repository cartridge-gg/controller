"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { constants, num } from "starknet";
import { useAccount, useNetwork } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button, Input } from "@cartridge/controller-ui";
import { BUNDLE_REGISTRY_MAINNET, BUNDLE_REGISTRY_SEPOLIA } from "./Profile";

export const Starterpack = () => {
  const { account, connector } = useAccount();
  const { chain } = useNetwork();

  const controllerConnector = connector as unknown as ControllerConnector;

  const getDefaultStarterpackIds = useCallback(() => {
    if (chain && num.toHex(chain.id) === constants.StarknetChainId.SN_MAIN) {
      return {
        bundleId: 1,
        socialBundleId: 0,
        starterpackId: 0,
        registryAddress: BUNDLE_REGISTRY_MAINNET,
      };
    }
    return {
      bundleId: 1,
      socialBundleId: 0,
      starterpackId: 0,
      registryAddress: BUNDLE_REGISTRY_SEPOLIA,
    };
  }, [chain]);

  const defaultIds = useMemo(
    () => getDefaultStarterpackIds(),
    [getDefaultStarterpackIds],
  );
  const [claimKeys, setClaimKeys] = useState<string>("priate-nation");
  const [claimTitle, setClaimTitle] = useState<string>("Pirate Nation");
  const [claimDescription, setClaimDescription] = useState<string>(
    "Claim games and tokens Pirate Nation holders",
  );
  const [claimPreimage, setClaimPreimage] = useState<string>("");
  const [purchaseOnchainSpId, setPurchaseOnchainSpId] = useState<number>(
    defaultIds.starterpackId,
  );
  const [bundleId, setBundleId] = useState<number>(defaultIds.bundleId);
  const [socialBundleId, setSocialBundleId] = useState<number>(
    defaultIds.socialBundleId,
  );
  const [registryAddress, setRegistryAddress] = useState<string>(
    defaultIds.registryAddress,
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
    setPurchaseOnchainSpId((currentPurchaseOnchainSpId) => {
      return currentPurchaseOnchainSpId === currentExpected.starterpackId
        ? newDefaults.starterpackId
        : currentPurchaseOnchainSpId;
    });

    setBundleId((currentBundleId) => {
      return currentBundleId === currentExpected.bundleId
        ? newDefaults.bundleId
        : currentBundleId;
    });

    setSocialBundleId((currentSocialBundleId) => {
      return currentSocialBundleId === currentExpected.socialBundleId
        ? newDefaults.socialBundleId
        : currentSocialBundleId;
    });

    setRegistryAddress((currentRegistryAddress) => {
      return currentRegistryAddress === currentExpected.registryAddress
        ? newDefaults.registryAddress
        : currentRegistryAddress;
    });

    // Update our references after successful comparison and update
    expectedDefaultsRef.current = newDefaults;
    previousChainRef.current = chain;
  }, [chain, getDefaultStarterpackIds]);

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-background-400 rounded">
      <h2>Bundles / Starterpacks</h2>

      <div className="flex flex-wrap gap-1">
        <Button
          onClick={() => {
            console.log(`bundleId:`, bundleId);
            controllerConnector.controller.username()?.then((username) => {
              controllerConnector.controller.openBundle(
                bundleId,
                registryAddress,
                {
                  onPurchaseComplete: () => {
                    console.log("Bundle play callback fired.");
                  },
                  socialClaimOptions: {
                    shareMessage: `Check out @numsgg!\nhttps://sepolia.nums.gg/?ref=${username}`,
                  },
                },
              );
            });
          }}
        >
          Nums Bundle
        </Button>
        <Button
          onClick={() => {
            console.log(`socialBundleId:`, socialBundleId);
            controllerConnector.controller.username()?.then((username) => {
              controllerConnector.controller.openBundle(
                socialBundleId,
                registryAddress,
                {
                  onPurchaseComplete: () => {
                    console.log("Bundle play callback fired.");
                  },
                  socialClaimOptions: {
                    shareMessage: `Check out @numsgg!\nhttps://sepolia.nums.gg/?ref=${username}`,
                  },
                },
              );
            });
          }}
        >
          Nums Social Bundle
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        <Button
          onClick={() => {
            console.log(`purchaseOnchainSpId:`, purchaseOnchainSpId);
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
          Nums Starterpack (old)
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3>Purchase Bundle</h3>
          <div className="flex items-center gap-2">
            <Input
              className="max-w-80"
              type="text"
              value={bundleId}
              onChange={(e) => setBundleId(Number(e.target.value))}
              placeholder="Enter bundle ID"
            />
            <Button
              onClick={() => {
                controllerConnector.controller.openBundle(
                  bundleId,
                  registryAddress,
                  {
                    onPurchaseComplete: () => {
                      console.log("Bundle play callback fired.");
                    },
                  },
                );
              }}
            >
              Purchase Bundle
            </Button>
          </div>
        </div>

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
            Purchase Starterpack
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h3>Claim Merkle Drop</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                className="max-w-80"
                type="text"
                value={claimKeys}
                onChange={(e) => setClaimKeys(e.target.value)}
                placeholder="Enter merkle drop keys (comma-separated)"
              />
              <Button
                onClick={() => {
                  const keys = claimKeys
                    .split(",")
                    .map((key) => key.trim())
                    .filter(Boolean);
                  if (keys.length === 0) {
                    return;
                  }
                  controllerConnector.controller.openMerkleDrops(keys, {
                    title: claimTitle.trim() || undefined,
                    description: claimDescription.trim() || undefined,
                    preimage: claimPreimage.trim() || undefined,
                    onClaimComplete: () => {
                      console.log("Merkle drop claim callback fired.");
                    },
                  });
                }}
              >
                Claim Merkle Drop with preimage
              </Button>
            </div>
            <Input
              className="max-w-80"
              type="text"
              value={claimTitle}
              onChange={(e) => setClaimTitle(e.target.value)}
              placeholder="Optional: Enter title"
            />
            <Input
              className="max-w-80"
              type="text"
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              placeholder="Optional: Enter description"
            />
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
