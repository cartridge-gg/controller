import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useConnection } from "@/hooks/connection";
import { CreateController } from "./connect";
import { CreateSession } from "./connect/CreateSession";
import Controller from "@/utils/controller";
import {
  createVerifiedSession,
  requiresSessionApproval,
} from "@/utils/connection/session-creation";

const POPUP_CLOSE_FALLBACK_MS = 2000;

/**
 * Standalone popup page rendered at /auth.
 * Opened by the keychain iframe when WebAuthn is unavailable in the iframe context.
 *
 * - action=connect: Full signup/login flow + session creation
 * - action=create-session: Load controller from shared localStorage, create session
 *
 * On completion, signals the iframe via postMessage and closes.
 */
export function PopupAuth() {
  const [searchParams] = useSearchParams();
  const {
    controller,
    setController,
    policies,
    origin,
    isPoliciesResolved,
    isConfigLoading,
  } = useConnection();

  const channelId = searchParams.get("channel_id");
  const action = searchParams.get("action") as
    | "connect"
    | "create-session"
    | null;
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
    (address: string, username: string) => {
      window.opener?.postMessage(
        {
          type: "auth-complete",
          channelId,
          address,
          username,
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

  // For action=create-session: try to auto-create verified session
  useEffect(() => {
    if (
      action !== "create-session" ||
      !controller ||
      !policies ||
      sessionComplete
    ) {
      return;
    }

    if (!isPoliciesResolved || isConfigLoading) {
      return;
    }

    // If session doesn't require approval, create it automatically
    if (!requiresSessionApproval(policies)) {
      (async () => {
        try {
          await createVerifiedSession({ controller, origin, policies });
          signalComplete(controller.address(), controller.username());
          setSessionComplete(true);
        } catch (e) {
          console.error("[PopupAuth] Failed to auto-create session:", e);
          signalError(e instanceof Error ? e.message : String(e));
        }
      })();
    }
  }, [
    action,
    controller,
    policies,
    origin,
    isPoliciesResolved,
    isConfigLoading,
    sessionComplete,
    signalComplete,
    signalError,
  ]);

  // For action=connect: once controller exists (user signed up/logged in),
  // attempt auto session creation or show CreateSession
  useEffect(() => {
    if (action !== "connect" || !controller || !policies || sessionComplete) {
      return;
    }

    if (!isPoliciesResolved || isConfigLoading) {
      return;
    }

    // If no approval needed, create session and signal completion
    if (!requiresSessionApproval(policies)) {
      (async () => {
        try {
          await createVerifiedSession({ controller, origin, policies });
          signalComplete(controller.address(), controller.username());
          setSessionComplete(true);
        } catch (e) {
          console.error(
            "[PopupAuth] Failed to auto-create session after connect:",
            e,
          );
          // Don't signal error here — fall through to CreateSession UI
        }
      })();
    }
  }, [
    action,
    controller,
    policies,
    origin,
    isPoliciesResolved,
    isConfigLoading,
    sessionComplete,
    signalComplete,
  ]);

  // Handle no-policy connect: once controller exists and policies are resolved, signal complete
  useEffect(() => {
    if (action !== "connect" || !controller || sessionComplete) {
      return;
    }

    if (!isPoliciesResolved || isConfigLoading) {
      return;
    }

    if (!policies) {
      signalComplete(controller.address(), controller.username());
      setSessionComplete(true);
    }
  }, [
    action,
    controller,
    policies,
    sessionComplete,
    signalComplete,
    isPoliciesResolved,
    isConfigLoading,
  ]);

  if (!channelId || !action) {
    return (
      <div className="flex items-center justify-center h-screen text-foreground-300">
        <p>Missing popup parameters.</p>
      </div>
    );
  }

  // action=connect and no controller: show signup/login flow
  if (action === "connect" && !controller) {
    const prefillUsername = searchParams.get("username") ?? undefined;
    return (
      <CreateController
        isSlot={false}
        signers={["webauthn"]}
        forcedAuthMethod="webauthn"
        prefillUsername={prefillUsername}
      />
    );
  }

  // action=create-session and no controller: load from storage
  if (action === "create-session" && !controller) {
    return <CreateSessionLoader setController={setController} />;
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
          signalComplete(controller.address(), controller.username());
          setSessionComplete(true);
        }}
        onSkip={() => {
          signalComplete(controller.address(), controller.username());
          setSessionComplete(true);
        }}
      />
    );
  }

  // Loading / waiting state
  return null;
}

/**
 * Loads controller from shared localStorage when popup opens for create-session.
 */
function CreateSessionLoader({
  setController,
}: {
  setController: (controller?: Controller) => void;
}) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const ctrl = await Controller.fromStore();
        if (!ctrl) {
          setError("No account found. Please sign in first.");
          return;
        }
        window.controller = ctrl;
        setController(ctrl);
      } catch (e) {
        console.error("[PopupAuth] Failed to load controller:", e);
        setError(e instanceof Error ? e.message : "Failed to load account");
      }
    })();
  }, [setController]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-foreground-300">
        <p>{error}</p>
      </div>
    );
  }

  return null;
}
