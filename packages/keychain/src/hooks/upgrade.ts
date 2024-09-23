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
];

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
  const [latest, setLatest] = useState<ControllerVersionInfo>();

  useEffect(() => {
    if (!controller) {
      return;
    }
    setIsSynced(false);

    controller.account
      .getClassHashAt(controller.address)
      .then((classHash) => {
        const current = CONTROLLER_VERSIONS.find(
          (v) => addAddressPadding(v.hash) === addAddressPadding(classHash),
        );
        const latest = CONTROLLER_VERSIONS[CONTROLLER_VERSIONS.length - 1];

        setCurrent(current);
        setLatest(latest);
        setAvailable(current?.version !== latest.version);
      })
      .catch((e) => {
        console.log(e);
        setError(e);
      })
      .finally(() => setIsSynced(true));
  }, [controller]);

  const calls = useMemo(() => {
    if (!controller || !latest) {
      return [];
    }

    return [controller.account.cartridge.upgrade(latest.hash)];
  }, [controller, latest]);

  const onUpgrade = useCallback(
    async (maxFee: BigNumberish) => {
      if (!controller || !latest) {
        return;
      }

      try {
        setIsUpgrading(true);
        const { transaction_hash } = await controller.account.execute(calls, {
          maxFee,
        });

        await controller.account.waitForTransaction(transaction_hash, {
          retryInterval: 1000,
        });

        setAvailable(false);
      } catch (e) {
        console.log({ e });
        setError(e);
      }
    },
    [controller, latest, calls],
  );

  return {
    available,
    current,
    latest,
    calls,
    isSynced,
    isUpgrading,
    error,
    onUpgrade,
  };
};
