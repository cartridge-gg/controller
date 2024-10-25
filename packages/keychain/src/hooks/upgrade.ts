import { useCallback, useEffect, useMemo, useState } from "react";
import { addAddressPadding, BigNumberish, Call } from "starknet";
import { ControllerError } from "utils/connection";
import Controller from "utils/controller";

export const CONTROLLER_VERSIONS: Array<ControllerVersionInfo> = [
  {
    version: "1.0.4",
    hash: "0x24a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
    changes: [],
  },
  {
    version: "1.0.5",
    hash: "0x32e17891b6cc89e0c3595a3df7cee760b5993744dc8dfef2bd4d443e65c0f40",
    changes: ["Improved session token implementation"],
  },
  {
    version: "1.0.6",
    hash: "0x220fafd2163c285f26a981772d96b0ce130ae1e4502ce45cc127ab87df295b0",
    changes: [
      "Support session key message signing",
      "Support session guardians",
      "Improve paymaster nonce management",
    ],
  },
];

const LATEST_CONTROLLER = CONTROLLER_VERSIONS[CONTROLLER_VERSIONS.length - 1];

type ControllerVersionInfo = {
  version: string;
  hash: string;
  changes: Array<string>;
};

export interface UpgradeInterface {
  available: boolean;
  current: ControllerVersionInfo;
  latest: ControllerVersionInfo;
  calls: Call[];
  isSynced: boolean;
  isUpgrading: boolean;
  error?: ControllerError;
  onUpgrade: (maxFee: BigNumberish) => Promise<void>;
}

export const useUpgrade = (controller: Controller): UpgradeInterface => {
  const [available, setAvailable] = useState<boolean>(false);
  const [error, setError] = useState<ControllerError>();
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [current, setCurrent] = useState<ControllerVersionInfo>();

  useEffect(() => {
    if (!controller) {
      return;
    }
    setIsSynced(false);

    controller
      .getClassHashAt(controller.address)
      .then((classHash) => {
        const current = CONTROLLER_VERSIONS.find(
          (v) => addAddressPadding(v.hash) === addAddressPadding(classHash),
        );

        setCurrent(current);
        setAvailable(current?.version !== LATEST_CONTROLLER.version);
      })
      .catch((e) => {
        if (e.message.includes("Contract not found")) {
          const current = CONTROLLER_VERSIONS.find(
            (v) =>
              addAddressPadding(v.hash) ===
              addAddressPadding(controller.cartridge.classHash()),
          );
          setCurrent(current);
          setAvailable(current?.version !== LATEST_CONTROLLER.version);
        } else {
          console.log(e);
          setError(e);
        }
      })
      .finally(() => setIsSynced(true));
  }, [controller]);

  const calls = useMemo(() => {
    if (!controller || !LATEST_CONTROLLER) {
      return [];
    }

    return [controller.cartridge.upgrade(LATEST_CONTROLLER.hash)];
  }, [controller]);

  const onUpgrade = useCallback(async () => {
    if (!controller || !LATEST_CONTROLLER) {
      return;
    }

    try {
      setIsUpgrading(true);
      const { transaction_hash } = await controller.executeFromOutsideV2(calls);

      await controller.waitForTransaction(transaction_hash, {
        retryInterval: 1000,
      });

      setAvailable(false);
    } catch (e) {
      console.log({ e });
      setError(e);
    }
  }, [controller, calls]);

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
