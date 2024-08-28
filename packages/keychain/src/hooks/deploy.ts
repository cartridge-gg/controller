import { useCallback, useEffect, useState } from "react";
import { num } from "starknet";
import { useConnection } from "./connection";
import { Status } from "utils/account";
import { useInterval } from "@chakra-ui/react";

type TransactionHash = string;

interface DeployInterface {
  deploySelf: (maxFee: string) => Promise<TransactionHash>;
  isDeploying: boolean;
  isDeployed: boolean;
}

export const useDeploy = (): DeployInterface => {
  const { controller } = useConnection();
  const [isDeployed, setIsDeployed] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const syncStatus = useCallback(async () => {
    if (!controller) return;

    const status = await controller.account.sync();
    setIsDeployed(status === Status.DEPLOYED);
  }, [controller]);

  useEffect(() => {
    syncStatus();
  }, [syncStatus]);

  useInterval(syncStatus, !isDeployed ? 1000 : null);

  const deploySelf = useCallback(
    async (maxFee: string) => {
      if (isDeployed) return;

      try {
        setIsDeploying(true);
        const { transaction_hash } =
          await controller.account.cartridge.deploySelf(num.toHex(maxFee));

        setIsDeployed(true);
        return transaction_hash;
      } catch (e) {
        if (!e.message.includes("account already deployed")) {
          throw e;
        }
      } finally {
        setIsDeploying(false);
      }
    },
    [controller, isDeployed],
  );

  return {
    deploySelf,
    isDeploying,
    isDeployed,
  };
};
