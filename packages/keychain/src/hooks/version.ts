import { ConnectCtx } from "@/utils/connection";
import { PACKAGE_VERSION } from "@/version";
import { useCallback } from "react";
import eq from "semver/functions/eq";
import gt from "semver/functions/gt";
import gte from "semver/functions/gte";
import lt from "semver/functions/lt";
import lte from "semver/functions/lte";
import { useConnection } from "./connection";

export const useVersion = () => {
  const { context } = useConnection();

  const controllerPackageVersion = (context as ConnectCtx)
    ?.controllerPackageVersion;

  const isControllerGt = useCallback(
    (version: string) => {
      try {
        return gt(controllerPackageVersion, version);
      } catch (error) {
        // either controllerPackagerVersion is undefined or invalid or version is invalid
        return false;
      }
    },
    [controllerPackageVersion],
  );

  const isControllerGte = useCallback(
    (version: string) => {
      try {
        return gte(controllerPackageVersion, version);
      } catch (error) {
        // either controllerPackagerVersion is undefined or invalid or version is invalid
        return false;
      }
    },
    [controllerPackageVersion],
  );

  const isControllerLt = useCallback(
    (version: string) => {
      try {
        return lt(controllerPackageVersion, version);
      } catch (error) {
        // either controllerPackagerVersion is undefined or invalid or version is invalid
        return false;
      }
    },
    [controllerPackageVersion],
  );

  const isControllerLte = useCallback(
    (version: string) => {
      try {
        return lte(controllerPackageVersion, version);
      } catch (error) {
        // either controllerPackagerVersion is undefined or invalid or version is invalid
        return false;
      }
    },
    [controllerPackageVersion],
  );

  const isControllerEq = useCallback(
    (version: string) => {
      try {
        return eq(controllerPackageVersion, version);
      } catch (error) {
        // either controllerPackagerVersion is undefined or invalid or version is invalid
        return false;
      }
    },
    [controllerPackageVersion],
  );

  return {
    controllerVersion: controllerPackageVersion,
    keychainVersion: PACKAGE_VERSION,
    isControllerGt,
    isControllerLt,
    isControllerEq,
    isControllerGte,
    isControllerLte,
  };
};
