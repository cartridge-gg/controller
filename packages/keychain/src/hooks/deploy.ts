import { useCallback, useState } from "react";
import { num } from "starknet";
import { useConnection } from "./connection";

type TransactionHash = string;

interface DeployInterface {
  deploySelf: (maxFee: string) => Promise<TransactionHash>;
  isDeploying: boolean;
}

export const useDeploy = (): DeployInterface => {
  const { controller } = useConnection();
  const [isDeploying, setIsDeploying] = useState(false);

  const deploySelf = useCallback(
    async (maxFee: string) => {
      if (!controller) return;
      try {
        setIsDeploying(true);
        const { transaction_hash } = await controller.cartridge.deploySelf(
          num.toHex(maxFee),
        );

        return transaction_hash;
      } catch (e) {
        if (!(e as Error).message?.includes("account already deployed")) {
          throw e;
        }
      }
    },
    [controller],
  );

  return {
    deploySelf,
    isDeploying,
  };
};
