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
      try {
        setIsDeploying(true);
        const { transaction_hash } = await controller.account.cartridge.deploySelf(
          controller.account,
          num.toHex(maxFee)
        );

        return transaction_hash;
      } catch (e) {
        if (!e.message.includes("account already deployed")) {
          throw e;
        }
      } finally {
        setIsDeploying(false);
      }
    },
    [controller],
  );

  return {
    deploySelf,
    isDeploying,
  };
};
