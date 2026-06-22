"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Account, Call, RpcProvider, num, shortString } from "starknet";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useNetwork,
} from "@starknet-react/core";
import { Button } from "@cartridge/controller-ui";
import ControllerConnector from "@cartridge/connector/controller";

const PREDEPLOYED_ACCOUNT_ADDRESS =
  "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec";
const PREDEPLOYED_ACCOUNT_PRIVATE_KEY =
  "0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912";
const KATANA_ETH_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const KATANA_STRK_ADDRESS =
  "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const ONE_ETH = 10n ** 18n;
const POINT_ONE_ETH = 10n ** 17n;

export const KatanaAppchain = () => {
  const { account, connector } = useAccount();
  const { chain } = useNetwork();
  const controller = connector as unknown as ControllerConnector;
  const chainName = shortString.decodeShortString(num.toHex(chain.id));
  const isKatana = chainName.includes("KATANA");

  // Player balances, refreshed on every new block via `watch`.
  const { data: ethBalance, refetch: refetchEth } = useBalance({
    token: KATANA_ETH_ADDRESS,
    address: account?.address as `0x${string}` | undefined,
    watch: true,
  });
  const { data: strkBalance, refetch: refetchStrk } = useBalance({
    token: KATANA_STRK_ADDRESS,
    address: account?.address as `0x${string}` | undefined,
    watch: true,
  });

  // RPC provider for the connected chain.
  const provider = useMemo(
    () => new RpcProvider({ nodeUrl: chain.rpcUrls.public.http[0] }),
    [chain],
  );

  // Predeployed faucet account (signer) for the connected chain.
  const signer = useMemo(
    () =>
      new Account({
        provider,
        address: PREDEPLOYED_ACCOUNT_ADDRESS,
        signer: PREDEPLOYED_ACCOUNT_PRIVATE_KEY,
      }),
    [provider],
  );

  // Whether the connected controller account is deployed on-chain.
  const [isDeployed, setIsDeployed] = useState<boolean>();
  const refetchDeployed = useCallback(() => {
    if (!account || !isKatana) {
      setIsDeployed(undefined);
      return;
    }
    let cancelled = false;
    provider
      .getClassHashAt(account.address)
      .then(() => !cancelled && setIsDeployed(true))
      .catch(() => !cancelled && setIsDeployed(false));
    return () => {
      cancelled = true;
    };
  }, [account, isKatana, provider]);

  // Re-checked on every block so it flips once the account deploys.
  const { data: blockNumber } = useBlockNumber({
    enabled: isKatana,
    refetchInterval: 2000,
  });
  useEffect(() => {
    refetchEth();
    refetchStrk();
    refetchDeployed();
  }, [blockNumber, refetchEth, refetchStrk, refetchDeployed]);

  const transfer = useCallback(
    async (tokenAddress: string, amount: bigint) => {
      if (!account) {
        return;
      }
      const { transaction_hash } = await signer.execute(
        [
          {
            contractAddress: tokenAddress,
            entrypoint: "transfer",
            // u256: amount fits in the low felt, high is 0.
            calldata: [account.address, num.toHex(amount), "0x0"],
          },
        ],
        { tip: 0 },
      );
      await signer.waitForTransaction(transaction_hash);
    },
    [account, signer],
  );

  const getETH = useCallback(
    () => transfer(KATANA_ETH_ADDRESS, ONE_ETH).catch((e) => console.error(e)),
    [transfer],
  );

  const getSTRK = useCallback(
    () =>
      transfer(KATANA_STRK_ADDRESS, 10n * ONE_ETH).catch((e) =>
        console.error(e),
      ),
    [transfer],
  );

  // Transfer 0.1 STRK from the controller to the predeployed account,
  // approving the transaction in the controller iframe.
  const sendSTRK = useCallback(
    (kind: "controller" | "signer") => {
      if (!account) {
        return;
      }
      const transactions: Call[] = [
        {
          contractAddress: KATANA_STRK_ADDRESS,
          entrypoint: "transfer",
          // u256: amount fits in the low felt, high is 0.
          calldata: [
            PREDEPLOYED_ACCOUNT_ADDRESS,
            num.toHex(POINT_ONE_ETH),
            "0x0",
          ],
        },
      ];
      if (kind == "controller") {
        controller.controller.openExecute(transactions).catch((e) => {
          console.error(e);
        });
      } else if (kind == "signer") {
        account.execute(transactions);
      }
    },
    [account, controller],
  );

  if (!account || !isKatana) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-background-400 rounded">
      <h2>Katana Appchain</h2>

      <div className="flex flex-col text-sm">
        <span>
          Controller:{" "}
          {isDeployed === undefined
            ? "checking…"
            : isDeployed
              ? "deployed"
              : "not deployed"}
        </span>
        <span>ETH: {ethBalance?.formatted ?? "-"}</span>
        <span>
          STRK: {strkBalance ? Number(strkBalance.formatted).toFixed(1) : "-"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        <Button onClick={() => getETH()}>Get 1 ETH</Button>
        <Button onClick={() => getSTRK()}>Get 10 STRK</Button>
        <Button onClick={() => sendSTRK("signer")}>
          Send 0.1 STRK via Signer
        </Button>
        <Button onClick={() => sendSTRK("controller")}>
          Send 0.1 STRK via Controller
        </Button>
      </div>
    </div>
  );
};
