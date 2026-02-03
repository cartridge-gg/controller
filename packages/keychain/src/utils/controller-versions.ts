import { addAddressPadding } from "starknet";

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

const normalizeHash = (hash: string) => addAddressPadding(hash).toLowerCase();

export function resolveOutsideExecutionVersion(
  classHash?: string,
  fallback: OutsideExecutionVersion = OutsideExecutionVersion.V3,
): OutsideExecutionVersion {
  if (!classHash) {
    return fallback;
  }

  const normalized = normalizeHash(classHash);
  const found = CONTROLLER_VERSIONS.find(
    (version) => normalizeHash(version.hash) === normalized,
  );

  return found ? found.outsideExecutionVersion : fallback;
}
