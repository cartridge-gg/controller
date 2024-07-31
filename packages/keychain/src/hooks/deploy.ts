import {
  DeployAccountDocument,
  DeployAccountMutation,
} from "generated/graphql";
import { useCallback, useEffect, useState } from "react";
import { constants, num, shortString } from "starknet";
import { client } from "utils/graphql";
import { useConnection } from "./connection";
import { Status } from "utils/account";
import { useInterval } from "@chakra-ui/react";

type TransactionHash = string;

interface DeployInterface {
  deployRequest: (username: string) => Promise<TransactionHash>;
  deploySelf: (maxFee: string) => Promise<TransactionHash>;
  isDeploying: boolean;
  isDeployed: boolean;
}

export const useDeploy = (): DeployInterface => {
  const { chainId, controller } = useConnection();
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

  const deployRequest = useCallback(
    async (username: string) => {
      if (isDeployed) return;

      if (chainId === constants.StarknetChainId.SN_MAIN)
        throw new Error("Mainnet not supported");

      try {
        setIsDeploying(true);
        const hash: DeployAccountMutation = await client.request(
          DeployAccountDocument,
          {
            id: username,
            chainId: `starknet:${shortString.decodeShortString(chainId)}`,
          },
        );

        setIsDeployed(true);
        return hash.deployAccount;
      } catch (e) {
        if (!e.message.includes("account already deployed")) {
          throw e;
        }
      } finally {
        setIsDeploying(false);
      }
    },
    [chainId, isDeployed],
  );

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
    deployRequest,
    deploySelf,
    isDeploying,
    isDeployed,
  };
};
