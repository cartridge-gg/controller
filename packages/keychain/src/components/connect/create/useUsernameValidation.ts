import { useState, useRef, useEffect } from "react";
import { fetchAccount } from "./utils";

export type ValidationState = {
  status: "idle" | "validating" | "valid" | "invalid";
  error?: Error;
  exists?: boolean;
};

export function useUsernameValidation(username: string) {
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

      // TEMP: allow periods for login and disabllow for signup below
      if (!/^[a-zA-Z0-9-.]+$/.test(username)) {
        setValidation({
          status: "invalid",
          error: new Error(
            "Username can only contain letters, numbers, and hyphens",
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
    const controller = new AbortController();
    validationController.current?.abort();
    validationController.current = controller;

    setValidation({ status: "validating" });

    fetchAccount(username, controller.signal)
      .then(() => {
        if (!controller.signal.aborted) {
          setValidation({
            status: "valid",
            exists: true,
          });
        }
      })
      .catch((e) => {
        if (controller.signal.aborted) return;

        if (e.message === "ent: account not found") {
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

    return () => controller.abort();
  }, [username]);

  return validation;
}
