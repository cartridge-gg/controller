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

  const { controllerVersion } = useConnection();

  useEffect(() => {
    if (controllerVersion) {
      setReady(true);
    }
  }, [controllerVersion]);

  const isControllerGt = useCallback(
    (version: string) => {
      return gt(controllerVersion!, version);
    },
    [controllerVersion],
  );

  const isControllerGte = useCallback(
    (version: string) => {
      return gte(controllerVersion!, version);
    },
    [controllerVersion],
  );

  const isControllerLt = useCallback(
    (version: string) => {
      return lt(controllerVersion!, version);
    },
    [controllerVersion],
  );

  const isControllerLte = useCallback(
    (version: string) => {
      return lte(controllerVersion!, version);
    },
    [controllerVersion],
  );

  const isControllerEq = useCallback(
    (version: string) => {
      return eq(controllerVersion!, version);
    },
    [controllerVersion],
  );

  return {
    ready,
    controllerVersion,
    keychainVersion: PACKAGE_VERSION,
    isControllerGt,
    isControllerLt,
    isControllerEq,
    isControllerGte,
    isControllerLte,
  };
};
