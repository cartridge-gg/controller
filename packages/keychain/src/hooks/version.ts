import { PACKAGE_VERSION } from "@/version";
import { useCallback, useEffect, useMemo, useState } from "react";
import eq from "semver/functions/eq";
import gt from "semver/functions/gt";
import gte from "semver/functions/gte";
import lt from "semver/functions/lt";
import lte from "semver/functions/lte";
import { useConnection } from "./connection";

export const useVersion = () => {
  const [ready, setReady] = useState(false);

  const { controllerVersion } = useConnection();

  // In standalone mode (no controller version provided), assume latest
  const effectiveVersion = useMemo(
    () => controllerVersion ?? PACKAGE_VERSION,
    [controllerVersion],
  );

  useEffect(() => {
    if (controllerVersion) {
      setReady(true);
    }
  }, [controllerVersion]);

  const isControllerGt = useCallback(
    (version: string) => {
      return gt(effectiveVersion, version);
    },
    [effectiveVersion],
  );

  const isControllerGte = useCallback(
    (version: string) => {
      return gte(effectiveVersion, version);
    },
    [effectiveVersion],
  );

  const isControllerLt = useCallback(
    (version: string) => {
      return lt(effectiveVersion, version);
    },
    [effectiveVersion],
  );

  const isControllerLte = useCallback(
    (version: string) => {
      return lte(effectiveVersion, version);
    },
    [effectiveVersion],
  );

  const isControllerEq = useCallback(
    (version: string) => {
      return eq(effectiveVersion, version);
    },
    [effectiveVersion],
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
