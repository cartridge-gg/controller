import { ConnectCtx } from "@/utils/connection";
import { PACKAGE_VERSION } from "@/version";
import { useCallback, useEffect, useState } from "react";
import eq from "semver/functions/eq";
import gt from "semver/functions/gt";
import gte from "semver/functions/gte";
import lt from "semver/functions/lt";
import lte from "semver/functions/lte";
import { useConnection } from "./connection";

export const useVersion = () => {
  const [ready, setReady] = useState(false);

  const { context } = useConnection();

  const controllerPackageVersion = (context as ConnectCtx)
    ?.controllerPackageVersion;

  useEffect(() => {
    if (context) {
      setReady(true);
    }
  }, [context]);

  const isControllerGt = useCallback(
    (version: string) => {
      return gt(controllerPackageVersion, version);
    },
    [controllerPackageVersion],
  );

  const isControllerGte = useCallback(
    (version: string) => {
      return gte(controllerPackageVersion, version);
    },
    [controllerPackageVersion],
  );

  const isControllerLt = useCallback(
    (version: string) => {
      return lt(controllerPackageVersion, version);
    },
    [controllerPackageVersion],
  );

  const isControllerLte = useCallback(
    (version: string) => {
      return lte(controllerPackageVersion, version);
    },
    [controllerPackageVersion],
  );

  const isControllerEq = useCallback(
    (version: string) => {
      return eq(controllerPackageVersion, version);
    },
    [controllerPackageVersion],
  );

  return {
    ready,
    controllerVersion: controllerPackageVersion,
    keychainVersion: PACKAGE_VERSION,
    isControllerGt,
    isControllerLt,
    isControllerEq,
    isControllerGte,
    isControllerLte,
  };
};
