import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useConnection } from "@/hooks/connection";
import { CreateController } from "./connect";
import { CreateSession } from "./connect/CreateSession";
import type { ImportedControllerState } from "@/utils/controller";
import {
  createVerifiedSession,
  requiresSessionApproval,
} from "@/utils/connection/session-creation";

const POPUP_CLOSE_FALLBACK_MS = 2000;

/**
 * Standalone popup page rendered at /auth.
 * Opened by the keychain iframe when WebAuthn is unavailable in the iframe context.
 *
 * - action=signup: Create account and requested session in the popup
 * - action=login: Log in and create the requested session in the popup
 *
 * On completion, signals the iframe via postMessage and closes.
 */
export function PopupAuth() {
  const [searchParams] = useSearchParams();
  const {
    controller,
    policies,
    origin,
    isPoliciesResolved,
    isConfigLoading,
    preset,
  } = useConnection();

  const channelId = searchParams.get("channel_id");
  const action = searchParams.get("action") as "signup" | "login" | null;
  const popupOrigin = window.location.origin;

  const closeTimeoutRef = useRef<number | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Open popup completion transport on mount.
  useEffect(() => {
    if (!channelId) return;

    const handleWindowMessage = (event: MessageEvent) => {
      if (
        event.origin === popupOrigin &&
        event.data?.type === "auth-ack" &&
        event.data?.channelId === channelId
      ) {
        window.close();
      }
    };
    window.addEventListener("message", handleWindowMessage);

    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [channelId, popupOrigin]);

  const signalComplete = useCallback(
    (state: ImportedControllerState) => {
      window.opener?.postMessage(
        {
          type: "auth-complete",
          channelId,
          state,
        },
        popupOrigin,
      );

      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }

      // Safari can report the popup as closed before delivery reaches the opener.
      // Wait for an explicit ack first, with a timeout fallback.
      closeTimeoutRef.current = window.setTimeout(() => {
        window.close();
      }, POPUP_CLOSE_FALLBACK_MS);
    },
    [channelId, popupOrigin],
  );

  const signalError = useCallback(
    (error: string) => {
      window.opener?.postMessage(
        {
          type: "auth-error",
          channelId,
          error,
        },
        popupOrigin,
      );
    },
    [channelId, popupOrigin],
  );

  const completePopupAuth = useCallback(async () => {
    if (!controller) {
      return;
    }

    const state = await controller.exportState(origin || undefined);
    signalComplete(state);
    setSessionComplete(true);
  }, [controller, origin, signalComplete]);

  useEffect(() => {
    if (!action || !controller || sessionComplete) {
      return;
    }

    if (!isPoliciesResolved || isConfigLoading) {
      return;
    }

    if (policies && requiresSessionApproval(policies)) {
      return;
    }

    void (async () => {
      try {
        if (policies) {
          await createVerifiedSession({ controller, origin, policies });
        }

        await completePopupAuth();
      } catch (e) {
        console.error("[PopupAuth] Failed to complete popup auth:", e);
        signalError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [
    controller,
    policies,
    origin,
    action,
    isPoliciesResolved,
    isConfigLoading,
    sessionComplete,
    completePopupAuth,
    signalError,
  ]);

  if (!channelId || !action) {
    return (
      <div className="flex items-center justify-center h-screen text-foreground-300">
        <p>Missing popup parameters.</p>
      </div>
    );
  }

  if (!controller) {
    const prefillUsername = searchParams.get("username") ?? undefined;
    return (
      <CreateController
        isSlot={preset === "slot"}
        signers={["webauthn"]}
        forcedAuthMethod="webauthn"
        forcedAction={action}
        prefillUsername={prefillUsername}
      />
    );
  }

  // Controller exists but policies need approval UI
  if (
    controller &&
    policies &&
    requiresSessionApproval(policies) &&
    !sessionComplete
  ) {
    return (
      <CreateSession
        policies={policies}
        onConnect={() => {
          void (async () => {
            try {
              await completePopupAuth();
            } catch (e) {
              console.error(
                "[PopupAuth] Failed to export popup auth state:",
                e,
              );
              signalError(e instanceof Error ? e.message : String(e));
            }
          })();
        }}
        onSkip={() => {
          void (async () => {
            try {
              await completePopupAuth();
            } catch (e) {
              console.error(
                "[PopupAuth] Failed to export popup auth state:",
                e,
              );
              signalError(e instanceof Error ? e.message : String(e));
            }
          })();
        }}
      />
    );
  }

  // Loading / waiting state
  return null;
}
