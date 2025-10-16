import { useConnection } from "@/hooks/connection";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import { useEffect, useRef, useState } from "react";
import { fetchController } from "./utils";

export type ValidationState = {
  status: "idle" | "validating" | "valid" | "invalid";
  signers?: CredentialMetadata[];
  error?: Error;
  exists?: boolean;
};

export function useUsernameValidation(username: string) {
  const { chainId } = useConnection();
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
  });
  const validationController = useRef<AbortController>(undefined);

  useEffect(() => {
    if (!username) {
      setValidation({ status: "idle" });
      return;
    }

    // Basic validation checks
    try {
      if (username.length < 3) {
        setValidation({
          status: "invalid",
          error: new Error("Username must be at least 3 characters"),
        });
        return;
      }

      if (username.split(" ").length > 1) {
        setValidation({
          status: "invalid",
          error: new Error("Username cannot contain spaces"),
        });
        return;
      }

      // TEMP: allow periods for login and disallow for signup below
      if (!/^[a-zA-Z0-9-.]+$/.test(username)) {
        setValidation({
          status: "invalid",
          error: new Error(
            "Username can only contain letters, numbers, and hyphens",
          ),
        });
        return;
      }

      // Check for specific blocked username
      if (username.toLowerCase() === "bramkaselo") {
        setValidation({
          status: "invalid",
          error: new Error(
            "Please come to the Cartridge Discord so we can help resolve your account: https://discord.com/invite/cartridge",
          ),
        });
        return;
      }
    } catch (e) {
      setValidation({
        status: "invalid",
        error: e as Error,
      });
      return;
    }

    // Network validation
    const abortController = new AbortController();
    validationController.current?.abort();
    validationController.current = abortController;

    setValidation({ status: "validating" });

    if (!chainId) {
      setValidation({
        status: "invalid",
        error: new Error("No chainId"),
      });
      return;
    }

    fetchController(chainId, username, abortController.signal)
      .then((controllerQuery) => {
        if (!abortController.signal.aborted) {
          setValidation({
            status: "valid",
            exists: true,
            signers: controllerQuery.controller?.signers?.map(
              (signer) => signer.metadata as CredentialMetadata,
            ),
          });
        }
      })
      .catch((e) => {
        if (abortController.signal.aborted) return;

        if (e.message === "ent: controller not found") {
          // TEMP: disallow periods for signup
          if (username.includes(".")) {
            setValidation({
              status: "invalid",
              error: new Error(
                "Username can only contain letters, numbers, and hyphens",
              ),
            });
            return;
          }

          // TEMP: disallow longer than 19 characters for signup
          if (username.length > 19) {
            setValidation({
              status: "invalid",
              error: new Error("Username cannot exceed 19 characters"),
            });
            return;
          }

          setValidation({
            status: "valid",
            exists: false,
          });
        } else {
          setValidation({
            status: "invalid",
            error: e,
          });
        }
      });

    return () => abortController.abort();
  }, [username, chainId]);

  return validation;
}
