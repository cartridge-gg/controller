import { createContext, ReactNode } from "react";
import { addAddressPadding, Call } from "starknet";
import type { Chain } from "@cartridge/controller";
import { ControllerError } from "@/utils/connection";
import Controller from "@/utils/controller";

export enum OutsideExecutionVersion {
  V2,
  V3,
}

export type ControllerVersionInfo = {
  version: string;
  hash: string;
  outsideExecutionVersion: OutsideExecutionVersion;
  changes: string[];
};

export const CONTROLLER_VERSIONS: ControllerVersionInfo[] = [
  {
    version: "1.0.4",
    hash: "0x24a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
    outsideExecutionVersion: OutsideExecutionVersion.V2,
    changes: [],
  },
  {
    version: "1.0.5",
    hash: "0x32e17891b6cc89e0c3595a3df7cee760b5993744dc8dfef2bd4d443e65c0f40",
    outsideExecutionVersion: OutsideExecutionVersion.V2,
    changes: ["Improved session token implementation"],
  },
  {
    version: "1.0.6",
    hash: "0x59e4405accdf565112fe5bf9058b51ab0b0e63665d280b816f9fe4119554b77",
    outsideExecutionVersion: OutsideExecutionVersion.V3,
    changes: [
      "Support session key message signing",
      "Support session guardians",
      "Improve paymaster nonce management",
    ],
  },
  {
    version: "1.0.7",
    hash: "0x3e0a04bab386eaa51a41abe93d8035dccc96bd9d216d44201266fe0b8ea1115",
    outsideExecutionVersion: OutsideExecutionVersion.V3,
    changes: ["Unified message signature verification"],
  },
  {
    version: "1.0.8",
    hash: "0x511dd75da368f5311134dee2356356ac4da1538d2ad18aa66d57c47e3757d59",
    outsideExecutionVersion: OutsideExecutionVersion.V3,
    changes: ["Improved session message signature"],
  },
  {
    version: "1.0.9",
    hash: "0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
    outsideExecutionVersion: OutsideExecutionVersion.V3,
    changes: ["Wildcard session support"],
  },
];

export const STABLE_CONTROLLER = CONTROLLER_VERSIONS[5];
export const BETA_CONTROLLER = CONTROLLER_VERSIONS[5];

export const findVersion = (
  classHash: string,
): ControllerVersionInfo | undefined =>
  CONTROLLER_VERSIONS.find(
    (v) => addAddressPadding(v.hash) === addAddressPadding(classHash),
  );

/**
 * Determines if an upgrade is available and returns the appropriate controller version
 * @param currentVersion The current controller version
 * @param isBeta Whether beta features are enabled
 * @returns An object containing whether an upgrade is available and the target controller version
 */
export function determineUpgradePath(
  currentVersion: ControllerVersionInfo | undefined,
  isBeta: boolean,
): { available: boolean; targetVersion: ControllerVersionInfo } {
  const targetVersion = isBeta ? BETA_CONTROLLER : STABLE_CONTROLLER;

  if (!currentVersion) {
    return { available: false, targetVersion };
  }

  // Find the indices of the current and target versions in the CONTROLLER_VERSIONS array
  const currentIndex = CONTROLLER_VERSIONS.findIndex(
    (v) => v === currentVersion,
  );
  const targetIndex = CONTROLLER_VERSIONS.findIndex((v) => v === targetVersion);

  // Only set available to true if the target controller is newer than the current one
  const available = currentIndex !== -1 && targetIndex > currentIndex;

  return { available, targetVersion };
}

export interface UpgradeInterface {
  available: boolean;
  current?: ControllerVersionInfo;
  latest: ControllerVersionInfo;
  calls: Call[];
  isSynced: boolean;
  isUpgrading: boolean;
  error?: ControllerError;
  onUpgrade: () => Promise<void>;
  isBeta: boolean;
}

export const UpgradeContext = createContext<UpgradeInterface | undefined>(
  undefined,
);

export interface UpgradeProviderProps {
  controller?: Controller;
  /** Chains the dapp explicitly configured (see
   *  `ConnectionContextValue.configuredChains`). The account's class is checked on
   *  each of them - not just the controller's active chain - so an upgrade is offered
   *  for e.g. an appchain still on a pre-wildcard class while the account is already
   *  up to date on the settlement chain. */
  chains?: Chain[];
  children: ReactNode;
}

/** A chain whose account is behind the target version. */
export type OutdatedChain = { rpcUrl: string; version: ControllerVersionInfo };
