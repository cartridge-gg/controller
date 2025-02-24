import { JsCall } from "@cartridge/account-wasm";
import { useCallback, useEffect, useState } from "react";
import { addAddressPadding, Call } from "starknet";
import { ControllerError } from "@/utils/connection";
import Controller from "@/utils/controller";

enum OutsideExecutionVersion {
  V2,
  V3,
}

export const CONTROLLER_VERSIONS: Array<ControllerVersionInfo> = [
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

export const LATEST_CONTROLLER = CONTROLLER_VERSIONS[5];

type ControllerVersionInfo = {
  version: string;
  hash: string;
  outsideExecutionVersion: OutsideExecutionVersion;
  changes: Array<string>;
};

export interface UpgradeInterface {
  available: boolean;
  current?: ControllerVersionInfo;
  latest: ControllerVersionInfo;
  calls: Call[];
  isSynced: boolean;
  isUpgrading: boolean;
  error?: ControllerError;
  onUpgrade: () => Promise<void>;
}

export const useUpgrade = (controller?: Controller): UpgradeInterface => {
  const [available, setAvailable] = useState<boolean>(false);
  const [error, setError] = useState<ControllerError>();
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [current, setCurrent] = useState<ControllerVersionInfo>();
  const [calls, setCalls] = useState<JsCall[]>([]);
  const [syncedControllerAddress, setSyncedControllerAddress] =
    useState<string>();

  useEffect(() => {
    if (!controller) {
      return;
    }

    // Skip if we already synced this controller
    if (syncedControllerAddress === controller.address()) {
      return;
    }

    setIsSynced(false);

    controller.provider
      .getClassHashAt(controller.address())
      .then((classHash) => {
        const current = CONTROLLER_VERSIONS.find(
          (v) => addAddressPadding(v.hash) === addAddressPadding(classHash),
        );

        setCurrent(current);
        setAvailable(current?.version !== LATEST_CONTROLLER.version);
        setSyncedControllerAddress(controller.address());
      })
      .catch((e) => {
        if (e.message.includes("Contract not found")) {
          const current = CONTROLLER_VERSIONS.find(
            (v) =>
              addAddressPadding(v.hash) ===
              addAddressPadding(controller.classHash()),
          );
          setCurrent(current);
          setAvailable(current?.version !== LATEST_CONTROLLER.version);
        } else {
          console.log(e);
          setError(e);
        }
      })
      .finally(() => {
        setSyncedControllerAddress(controller.address());
        setIsSynced(true);
      });
  }, [controller, syncedControllerAddress]);

  useEffect(() => {
    if (!controller || !LATEST_CONTROLLER) {
      setCalls([]);
    } else {
      controller.upgrade(LATEST_CONTROLLER.hash).then((call) => {
        setCalls([call]);
      });
    }
  }, [controller]);

  const onUpgrade = useCallback(async () => {
    if (!controller || !LATEST_CONTROLLER) {
      return;
    }

    try {
      setIsUpgrading(true);

      let transaction_hash: string;
      if (current?.outsideExecutionVersion === OutsideExecutionVersion.V2) {
        transaction_hash = (await controller.executeFromOutsideV2(calls))
          .transaction_hash;
      } else {
        transaction_hash = (await controller.executeFromOutsideV3(calls))
          .transaction_hash;
      }

      await controller.provider.waitForTransaction(transaction_hash, {
        retryInterval: 1000,
      });

      setAvailable(false);
    } catch (e) {
      console.log({ e });
      setError(e as unknown as ControllerError);
    }
  }, [controller, current, calls]);

  return {
    available,
    current,
    latest: LATEST_CONTROLLER,
    calls,
    isSynced,
    isUpgrading,
    error,
    onUpgrade,
  };
};
