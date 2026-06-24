import React, { useState, useEffect, useMemo, useCallback } from "react";
import { JsCall } from "@cartridge/controller-wasm";
import { RpcProvider } from "starknet";
import { ControllerError } from "@/utils/connection";
import Controller from "@/utils/controller";
import { usePostHog } from "./posthog";
import {
  BETA_CONTROLLER,
  ControllerVersionInfo,
  determineUpgradePath,
  findVersion,
  OutdatedChain,
  OutsideExecutionVersion,
  STABLE_CONTROLLER,
  UpgradeContext,
  UpgradeInterface,
  UpgradeProviderProps,
} from "./upgrade-context";

/** The controller version actually deployed at `address` on a chain, or `undefined`
 *  when the account isn't deployed there yet.
 *
 *  A counterfactual account's address is bound to its creation class, so it can only
 *  ever deploy *as* that class and then upgrade in place — there's no way to upgrade it
 *  before it exists on-chain (the upgrade runs via `execute_from_outside`, which needs a
 *  deployed contract). So we deliberately do NOT report the creation class here: a not-
 *  yet-deployed account must not be flagged as "outdated", or we'd offer a premature
 *  upgrade that can't execute. It deploys at its creation class on first use, and the
 *  upgrade is offered then — once `getClassHashAt` returns a real, deployed class. */
async function deployedVersion(
  provider: Pick<RpcProvider, "getClassHashAt">,
  address: string,
): Promise<ControllerVersionInfo | undefined> {
  try {
    return findVersion(await provider.getClassHashAt(address));
  } catch (e) {
    if ((e as Error).message?.includes("Contract not found")) {
      return undefined;
    }
    throw e;
  }
}

export const UpgradeProvider: React.FC<UpgradeProviderProps> = ({
  controller,
  chains,
  children,
}) => {
  const [available, setAvailable] = useState<boolean>(false);
  const [error, setError] = useState<ControllerError | undefined>(undefined);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [current, setCurrent] = useState<ControllerVersionInfo | undefined>(
    undefined,
  );
  const [outdated, setOutdated] = useState<OutdatedChain[]>([]);
  const [calls, setCalls] = useState<JsCall[]>([]);
  const posthog = usePostHog();
  const [isBeta, setIsBeta] = useState<boolean>(false);
  const [featureFlagLoaded, setFeatureFlagLoaded] = useState<boolean>(false);

  // Pick controller based on feature flag
  const effectiveController = useMemo(
    () => (isBeta ? BETA_CONTROLLER : STABLE_CONTROLLER),
    [isBeta],
  );

  // Load feature flag
  useEffect(() => {
    if (!posthog || !controller || featureFlagLoaded) return;
    posthog.onFeatureFlag("controller-beta", (value: string | boolean) => {
      const newValue = typeof value === "boolean" ? value : value === "true";
      setIsBeta(newValue);
      setFeatureFlagLoaded(true);
    });
  }, [posthog, controller, featureFlagLoaded]);

  // Resolve the account's version on every configured chain (the active one first —
  // its version is what the UI reports as `current`) and collect the ones that are
  // behind. An upgrade is offered if ANY chain is outdated.
  useEffect(() => {
    if (!controller) return;
    let cancelled = false;

    (async () => {
      try {
        const address = controller.address();
        // const creationClassHash = controller.classHash();
        const activeRpcUrl = controller.rpcUrl();

        const active = await deployedVersion(controller.provider, address);

        const others = await Promise.all(
          (chains ?? [])
            .map((chain) => chain.rpcUrl)
            .filter((rpcUrl) => rpcUrl !== activeRpcUrl)
            .map(async (rpcUrl) => {
              try {
                const provider = new RpcProvider({ nodeUrl: rpcUrl });
                return {
                  rpcUrl,
                  version: await deployedVersion(provider, address),
                };
              } catch {
                // A single unreachable chain must not block the upgrade gate.
                return { rpcUrl, version: undefined };
              }
            }),
        );

        if (cancelled) return;

        const outdated = [
          { rpcUrl: activeRpcUrl, version: active },
          ...others,
        ].filter(
          (c): c is OutdatedChain =>
            !!c.version && determineUpgradePath(c.version, isBeta).available,
        );

        setCurrent(active);
        setOutdated(outdated);
        setAvailable(outdated.length > 0);
        setIsSynced(true);
      } catch (e) {
        if (!cancelled) {
          setError(e as ControllerError);
          setIsSynced(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [controller, chains, isBeta]);

  useEffect(() => {
    if (!controller || !effectiveController) {
      setCalls([]);
      return;
    }

    controller.upgrade(effectiveController.hash).then((call) => {
      setCalls([call]);
    });
  }, [controller, effectiveController]);

  const onUpgrade = useCallback(async () => {
    if (!controller || !effectiveController || outdated.length === 0) return;
    try {
      setIsUpgrading(true);

      // Upgrade every chain that's behind. An outside execution is signed for a
      // specific chain, so each one runs on a controller pinned to that chain.
      for (const { rpcUrl, version } of outdated) {
        const target =
          rpcUrl === controller.rpcUrl()
            ? controller
            : await Controller.create({
                classHash: controller.classHash(),
                rpcUrl,
                address: controller.address(),
                username: controller.username(),
                owner: controller.owner(),
              });

        const calls = [await target.upgrade(effectiveController.hash)];
        const { transaction_hash } =
          version.outsideExecutionVersion === OutsideExecutionVersion.V2
            ? await target.executeFromOutsideV2(calls)
            : await target.executeFromOutsideV3(calls);

        await target.provider.waitForTransaction(transaction_hash, {
          retryInterval: 1000,
        });
      }

      setOutdated([]);
      setAvailable(false);
    } catch (e) {
      setError(e as ControllerError);
    } finally {
      setIsUpgrading(false);
    }
  }, [controller, outdated, effectiveController]);

  const value = useMemo<UpgradeInterface>(
    () => ({
      available,
      current,
      latest: effectiveController,
      calls,
      isSynced,
      isUpgrading,
      error,
      onUpgrade,
      isBeta,
    }),
    [
      available,
      current,
      effectiveController,
      calls,
      isSynced,
      isUpgrading,
      error,
      onUpgrade,
      isBeta,
    ],
  );

  return (
    <UpgradeContext.Provider value={value}>{children}</UpgradeContext.Provider>
  );
};
