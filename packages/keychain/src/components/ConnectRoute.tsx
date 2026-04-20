import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { hasApprovalPolicies } from "@/hooks/session";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseConnectParams } from "@/utils/connection/connect";
import { hasConfiguredLocationGate } from "@/utils/location-gate";
import { createLocationGateUrl } from "@/utils/connection/location-gate";
import { CreateSession } from "./connect/CreateSession";
import {
  createVerifiedSession,
  requiresSessionApproval,
} from "@/utils/connection/session-creation";
import {
  useRouteParams,
  useRouteCompletion,
  useRouteCallbacks,
} from "@/hooks/route";
import { isIframe } from "@cartridge/controller-ui/utils";
import { safeRedirect } from "@/utils/url-validator";
import { requestStorageAccess } from "@/utils/connection/storage-access";
import { openPopupAuth } from "@/utils/connection/popup";
import Controller from "@/utils/controller";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import { ControllerErrorAlert } from "@/components/ErrorAlert";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

// Chrome on iOS uses WebKit under the hood and requires a user gesture
// for navigator.credentials.get(). Auto session creation in useEffect
// fails silently, so we show a "Continue" button instead.
const isChromeIOS =
  typeof navigator !== "undefined" && /CriOS/i.test(navigator.userAgent);

export function ConnectRoute() {
  const {
    controller,
    policies,
    origin,
    theme,
    webauthnPopup,
    setController,
    preset,
    policiesStr,
    rpcUrl,
    locationGate,
    locationGateVerified,
  } = useConnection();
  const navigate = useNavigate();
  const [hasAutoConnected, setHasAutoConnected] = useState(false);
  const [isSessionCreating, setIsSessionCreating] = useState(false);
  const [sessionError, setSessionError] = useState<Error>();
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [hasRequestedSession, setHasRequestedSession] = useState<
    boolean | undefined
  >(undefined);

  const popupParams = useMemo(
    () => ({
      preset: preset ?? undefined,
      rpcUrl,
      policiesStr: policiesStr ?? undefined,
      origin,
    }),
    [preset, rpcUrl, policiesStr, origin],
  );

  // Parse params and set RPC URL immediately
  const params = useRouteParams((searchParams: URLSearchParams) => {
    return parseConnectParams(searchParams);
  });

  const handleCompletion = useRouteCompletion();

  useRouteCallbacks(params, CANCEL_RESPONSE);

  // Check if this is standalone mode (not in iframe)
  const isStandalone = useMemo(() => !isIframe(), []);

  // Get redirect_url from query params for standalone mode
  const redirectUrl = useMemo(() => {
    if (isStandalone) {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get("redirect_url");
    }
    return null;
  }, [isStandalone]);

  const hasTokenApprovals = useMemo(
    () => hasApprovalPolicies(policies),
    [policies],
  );

  const requiresWebauthnPopup = useMemo(() => {
    if (!webauthnPopup.get || !controller) {
      return false;
    }

    const owner = controller.owner();
    return Boolean(owner.signer?.webauthn || owner.signer?.webauthns?.length);
  }, [webauthnPopup, controller]);

  useEffect(() => {
    if (!requiresWebauthnPopup || !controller || !policies) {
      setHasRequestedSession(undefined);
      return;
    }

    let cancelled = false;
    setHasRequestedSession(undefined);

    controller
      .isRequestedSession(origin, policies)
      .then((hasSession) => {
        if (!cancelled) {
          setHasRequestedSession(hasSession);
        }
      })
      .catch((error) => {
        console.error(
          "[ConnectRoute] Failed to check existing session:",
          error,
        );
        if (!cancelled) {
          setHasRequestedSession(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requiresWebauthnPopup, controller, policies, origin]);

  const clearConnectParams = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url.toString());
  }, []);

  const handleConnect = useCallback(async () => {
    if (!params || !controller) {
      return;
    }

    // In iframe context, request storage access on user gesture so
    // third-party storage can persist across app restarts.
    if (!isStandalone) {
      try {
        await requestStorageAccess();
      } catch (error) {
        console.error("[ConnectRoute] Storage access request failed:", error);
      }
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    if (params.params.id) {
      cleanupCallbacks(params.params.id);
    }
    clearConnectParams();

    // In standalone mode with redirect_url, redirect instead of calling handleCompletion
    // Add lastUsedConnector query param to indicate controller was used
    // if (isStandalone && redirectUrl) {
    //   console.log("redirecting");
    //   try {
    //     // Create encrypted snapshot and append to URL fragment
    //     const encryptedBlob = await snapshotLocalStorageToCookie();
    //     const redirectWithFragment =
    //       encryptedBlob && encryptedBlob.length > 0
    //         ? mergeUrlFragment(redirectUrl, {
    //             kc: encryptedBlob,
    //           })
    //         : redirectUrl;
    //     safeRedirect(redirectWithFragment, true);
    //   } catch (error) {
    //     console.error(
    //       "[ConnectRoute] Failed to create storage snapshot:",
    //       error,
    //     );
    //     // Continue with redirect even if snapshot fails
    //     safeRedirect(redirectUrl, true);
    //   }
    //   return;
    // }

    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl, true);
      return;
    }

    handleCompletion();
  }, [
    params,
    controller,
    clearConnectParams,
    handleCompletion,
    isStandalone,
    redirectUrl,
  ]);

  const handleSkip = useCallback(async () => {
    if (!params || !controller) {
      return;
    }

    if (!isStandalone) {
      try {
        await requestStorageAccess();
      } catch (error) {
        console.error("[ConnectRoute] Storage access request failed:", error);
      }
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    if (params.params.id) {
      cleanupCallbacks(params.params.id);
    }
    clearConnectParams();

    // In standalone mode with redirect_url, redirect instead of calling handleCompletion
    // Add lastUsedConnector query param to indicate controller was used
    // if (isStandalone && redirectUrl) {
    //   console.log("redirecting skip");
    //   try {
    //     // Create encrypted snapshot and append to URL fragment
    //     const encryptedBlob = await snapshotLocalStorageToCookie();
    //     const redirectWithFragment =
    //       encryptedBlob && encryptedBlob.length > 0
    //         ? mergeUrlFragment(redirectUrl, {
    //             kc: encryptedBlob,
    //           })
    //         : redirectUrl;
    //     safeRedirect(redirectWithFragment, true);
    //   } catch (error) {
    //     console.error(
    //       "[ConnectRoute] Failed to create storage snapshot:",
    //       error,
    //     );
    //     // Continue with redirect even if snapshot fails
    //     safeRedirect(redirectUrl, true);
    //   }
    //   return;
    // }

    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl, true);
      return;
    }

    handleCompletion();
  }, [
    params,
    controller,
    clearConnectParams,
    handleCompletion,
    isStandalone,
    redirectUrl,
  ]);

  // Handle cases where we can connect immediately (embedded mode only)
  useEffect(() => {
    if (!params || !controller || hasAutoConnected) {
      return;
    }

    // If location gate is configured but not yet verified, redirect to it
    // before allowing any auto-connect. This catches the race condition where
    // connect() was called before the preset config loaded.
    if (hasConfiguredLocationGate(locationGate) && !locationGateVerified) {
      const currentUrl = window.location.pathname + window.location.search;
      navigate(
        createLocationGateUrl({ returnTo: currentUrl, gate: locationGate! }),
        { replace: true },
      );
      return;
    }

    if (requiresWebauthnPopup && policies) {
      if (hasRequestedSession === undefined) {
        return;
      }

      if (hasRequestedSession) {
        setHasAutoConnected(true);
        clearConnectParams();
        params.resolve?.({
          code: ResponseCodes.SUCCESS,
          address: controller.address(),
        });

        if (params.params.id) {
          cleanupCallbacks(params.params.id);
        }
        handleCompletion();
        return;
      }
    }

    // In standalone mode with redirect_url, redirect immediately
    // if (isStandalone && redirectUrl) {
    //   console.log("redirecting effect");
    //   (async () => {
    //     try {
    //       // Create encrypted snapshot and append to URL fragment
    //       const encryptedBlob = await snapshotLocalStorageToCookie();
    //       const redirectWithFragment =
    //         encryptedBlob && encryptedBlob.length > 0
    //           ? mergeUrlFragment(redirectUrl, {
    //               kc: encryptedBlob,
    //             })
    //           : redirectUrl;
    //       safeRedirect(redirectWithFragment, true);
    //     } catch (error) {
    //       console.error(
    //         "[ConnectRoute] Failed to create storage snapshot:",
    //         error,
    //       );
    //       // Continue with redirect even if snapshot fails
    //       safeRedirect(redirectUrl, true);
    //     }
    //   })();
    //   return;
    // }

    // Mark as auto-connected immediately to prevent race conditions
    setHasAutoConnected(true);

    // if no policies, we can connect immediately
    if (!policies) {
      params.resolve?.({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });

      if (params.params.id) {
        cleanupCallbacks(params.params.id);
      }
      handleCompletion();
      return;
    }

    // Bypass session approval screen for verified sessions in embedded mode
    // Note: This is a fallback - main logic is handled in useCreateController
    if (!requiresSessionApproval(policies)) {
      const createSessionForVerifiedPolicies = async () => {
        try {
          if (requiresWebauthnPopup) {
            // When session auth relies on WebAuthn, delegate it to a popup window.
            await createSessionViaPopup(controller, setController, popupParams);
          } else {
            await createVerifiedSession({
              controller,
              origin,
              policies,
            });
          }
          params.resolve?.({
            code: ResponseCodes.SUCCESS,
            address: controller.address(),
          });
          if (params.params.id) {
            cleanupCallbacks(params.params.id);
          }
          handleCompletion();
        } catch (e) {
          console.error("Failed to create verified session:", e);

          if (isChromeIOS) {
            // Chrome iOS requires a user gesture for navigator.credentials.get().
            // Show a "Continue" button so the user tap provides the gesture.
            setShowContinueButton(true);
          } else {
            // Fall back to rejecting on other browsers
            params.reject?.(e);
          }
        }
      };

      void createSessionForVerifiedPolicies();
    }
  }, [
    params,
    controller,
    policies,
    handleCompletion,
    isStandalone,
    redirectUrl,
    hasAutoConnected,
    hasTokenApprovals,
    origin,
    requiresWebauthnPopup,
    hasRequestedSession,
    setController,
    popupParams,
    clearConnectParams,
    locationGate,
    locationGateVerified,
    navigate,
  ]);

  // Don't render anything if we don't have controller yet - CreateController handles loading
  if (!controller) {
    return null;
  }

  // Embedded mode: No policies and verified policies are handled in useCreateController
  // This component only handles unverified policies that need user consent
  if (!policies) {
    // This should not be reached as no policies case is handled in useCreateController
    return null;
  }

  if (requiresWebauthnPopup && hasRequestedSession === undefined) {
    return null;
  }

  if (requiresWebauthnPopup && hasRequestedSession) {
    return null;
  }

  if (policies.verified && !hasTokenApprovals) {
    // Auto session creation failed on Chrome iOS — show a "Continue" button
    // so the user tap provides the gesture required by WebAuthn.
    if (showContinueButton) {
      const handleContinue = async () => {
        if (!controller) return;
        setIsSessionCreating(true);
        setSessionError(undefined);
        try {
          if (requiresWebauthnPopup) {
            await createSessionViaPopup(controller, setController, popupParams);
          } else {
            await createVerifiedSession({ controller, origin, policies });
          }
          params?.resolve?.({
            code: ResponseCodes.SUCCESS,
            address: controller.address(),
          });
          if (params?.params.id) {
            cleanupCallbacks(params.params.id);
          }
          handleCompletion();
        } catch (e) {
          console.error("Failed to create verified session:", e);
          setSessionError(e instanceof Error ? e : new Error(String(e)));
        } finally {
          setIsSessionCreating(false);
        }
      };

      return (
        <>
          <HeaderInner
            className="pb-0"
            title={theme ? theme.name : "Create Session"}
          />
          <LayoutContent />
          <LayoutFooter>
            {sessionError && (
              <ControllerErrorAlert className="mb-3" error={sessionError} />
            )}
            <Button
              className="w-full"
              disabled={isSessionCreating}
              isLoading={isSessionCreating}
              onClick={() => void handleContinue()}
            >
              continue
            </Button>
          </LayoutFooter>
        </>
      );
    }

    // Auto-creation either succeeded or is in progress
    return null;
  }

  // Show CreateSession for sessions that require approval UI.
  // Only WebAuthn-backed controllers need to proxy this through a popup.
  if (requiresWebauthnPopup) {
    return (
      <PopupSessionProxy
        controller={controller}
        onConnect={handleConnect}
        onSkip={handleSkip}
        setController={setController}
        popupParams={popupParams}
      />
    );
  }

  return (
    <CreateSession
      policies={policies}
      onConnect={handleConnect}
      onSkip={handleSkip}
    />
  );
}

/**
 * In popup mode, opens a popup for session creation that requires user approval.
 * The popup handles the CreateSession UI + WebAuthn signing.
 */
function PopupSessionProxy({
  controller,
  onConnect,
  setController,
  popupParams,
}: {
  controller: Controller;
  onConnect: () => void;
  onSkip?: () => void;
  setController: (controller?: Controller) => void;
  popupParams: {
    preset?: string;
    rpcUrl?: string;
    policiesStr?: string;
    origin?: string;
  };
}) {
  const [error, setError] = useState<string>();
  const hasOpened = useRef(false);

  useEffect(() => {
    if (hasOpened.current) return;
    hasOpened.current = true;

    (async () => {
      try {
        await createSessionViaPopup(controller, setController, popupParams);
        onConnect();
      } catch (e) {
        console.error("[PopupSessionProxy] Popup session creation failed:", e);
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [controller, onConnect, setController, popupParams]);

  if (error) {
    return (
      <>
        <HeaderInner className="pb-0" title="Session Creation" />
        <LayoutContent />
        <LayoutFooter>
          <ControllerErrorAlert className="mb-3" error={new Error(error)} />
          <Button
            className="w-full"
            onClick={() => {
              setError(undefined);
              hasOpened.current = false;
            }}
          >
            retry
          </Button>
        </LayoutFooter>
      </>
    );
  }

  // Loading state while popup is open
  return (
    <>
      <HeaderInner
        className="pb-0"
        title="Complete in popup"
        description="Please complete the authentication in the popup window."
      />
      <LayoutContent />
    </>
  );
}

/**
 * Opens a popup for WebAuthn-backed session creation and imports the
 * returned controller/session state into the iframe store.
 */
async function createSessionViaPopup(
  currentController: Controller,
  setController: (controller?: Controller) => void,
  params: {
    preset?: string;
    rpcUrl?: string;
    policiesStr?: string;
    origin?: string;
  },
): Promise<void> {
  const popupState = await openPopupAuth({
    action: "login",
    username: currentController.username(),
    preset: params.preset ?? undefined,
    rpcUrl: params.rpcUrl ?? undefined,
    policies: params.policiesStr ?? undefined,
    origin: params.origin ?? undefined,
  });

  const controller = await Controller.importState(popupState);
  window.controller = controller;
  setController(controller);
}
