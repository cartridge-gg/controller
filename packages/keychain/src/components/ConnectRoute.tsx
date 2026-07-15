import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { hasApprovalPolicies } from "@/hooks/session";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import {
  createConnectReply,
  parseConnectParams,
  supportsConnectKeepOpen,
} from "@/utils/connection/connect";
import { hasConfiguredLocationGate } from "@/utils/location-gate";
import {
  LocationGate,
  type LocationGateResponse,
} from "./location/LocationGate";
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
import { setBearerToken } from "@/utils/bearer-token";
import Controller from "@/utils/controller";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { useGeoLocation } from "@/hooks/geo";

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
    chainPolicies,
    origin,
    theme,
    webauthnPopup,
    setController,
    preset,
    policiesStr,
    rpcUrl,
    locationGate,
    isNewControllerRef,
    controllerVersion,
    closeModal,
  } = useConnection();
  const [hasAutoConnected, setHasAutoConnected] = useState(false);
  const [isSessionCreating, setIsSessionCreating] = useState(false);
  const [sessionError, setSessionError] = useState<Error>();
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [locationGateVerified, setLocationGateVerified] = useState(false);
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
  const canKeepOpen = supportsConnectKeepOpen(controllerVersion, isStandalone);
  const { isUS, countryCodeLoaded } = useGeoLocation();

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

    params.resolve?.(
      createConnectReply(
        controller.address(),
        isNewControllerRef.current === true,
        canKeepOpen,
      ),
    );
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
    isNewControllerRef,
    canKeepOpen,
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

    params.resolve?.(
      createConnectReply(
        controller.address(),
        isNewControllerRef.current === true,
        canKeepOpen,
      ),
    );
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
    isNewControllerRef,
    canKeepOpen,
  ]);

  // Handle cases where we can connect immediately (embedded mode only)
  useEffect(() => {
    if (!params || !controller || hasAutoConnected) {
      return;
    }

    const hasLocationGate = hasConfiguredLocationGate(locationGate);

    // Location gating is a US-only feature. Wait for the shared IP-country
    // lookup before deciding whether a GPS check is required so connect cannot
    // race ahead for a US user.
    if (hasLocationGate && !countryCodeLoaded) {
      return;
    }

    // The gate renders inline below (never navigate away: unmounting this
    // route deletes the stored connect callbacks, leaving the parent SDK's
    // connect() promise unresolved). Hold auto-connect until it verifies.
    if (hasLocationGate && isUS && !locationGateVerified) {
      return;
    }

    if (requiresWebauthnPopup && policies) {
      if (hasRequestedSession === undefined) {
        return;
      }

      if (hasRequestedSession) {
        setHasAutoConnected(true);
        clearConnectParams();
        params.resolve?.(
          createConnectReply(
            controller.address(),
            isNewControllerRef.current === true,
            canKeepOpen,
          ),
        );

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
      params.resolve?.(
        createConnectReply(
          controller.address(),
          isNewControllerRef.current === true,
          canKeepOpen,
        ),
      );

      if (params.params.id) {
        cleanupCallbacks(params.params.id);
      }
      handleCompletion();
      return;
    }

    // Bypass session approval screen for verified sessions in embedded mode
    // Note: This is a fallback - main logic is handled in useCreateController
    if (!requiresSessionApproval(policies, chainPolicies)) {
      const createSessionForVerifiedPolicies = async () => {
        try {
          if (requiresWebauthnPopup) {
            // When session auth relies on WebAuthn, delegate it to a popup window.
            // The popup export blob carries a single session, so multichain
            // approvals degrade to the active chain here.
            if (chainPolicies?.length) {
              console.warn(
                "[ConnectRoute] Multichain sessions are not supported via the WebAuthn popup flow; creating a session for the active chain only.",
              );
            }
            await createSessionViaPopup(controller, setController, popupParams);
          } else {
            await createVerifiedSession({
              controller,
              origin,
              policies,
              chainPolicies,
            });
          }
          params.resolve?.(
            createConnectReply(
              controller.address(),
              isNewControllerRef.current === true,
              canKeepOpen,
            ),
          );
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
    chainPolicies,
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
    countryCodeLoaded,
    isUS,
    isNewControllerRef,
    canKeepOpen,
  ]);

  // Terminal gate outcomes (cancel, blocked region) settle the pending
  // connect so the parent SDK promise never hangs, then close the modal.
  const handleGateExit = useCallback(
    (response: LocationGateResponse) => {
      params?.resolve?.(response);
      if (params?.params.id) {
        cleanupCallbacks(params.params.id);
      }
      closeModal?.();
    },
    [params, closeModal],
  );

  const handleGateVerified = useCallback(() => {
    setLocationGateVerified(true);
  }, []);

  // Don't render anything if we don't have controller yet - CreateController handles loading
  if (!controller) {
    return null;
  }

  const hasLocationGate = hasConfiguredLocationGate(locationGate);

  // Hold rendering until the IP-country lookup decides whether the GPS gate
  // applies, so gated flows cannot flash a connect UI before the gate.
  if (hasLocationGate && !countryCodeLoaded) {
    return null;
  }

  // Render the gate inline so this route (and its pending connect callbacks)
  // stays mounted while the user verifies their location.
  if (hasLocationGate && isUS && !locationGateVerified) {
    return (
      <LocationGate
        gate={locationGate!}
        onExit={handleGateExit}
        onVerified={handleGateVerified}
        persistVerification={false}
      />
    );
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

  if (!requiresSessionApproval(policies, chainPolicies)) {
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
            await createVerifiedSession({
              controller,
              origin,
              policies,
              chainPolicies,
            });
          }
          params?.resolve?.(
            createConnectReply(
              controller.address(),
              isNewControllerRef.current === true,
              canKeepOpen,
            ),
          );
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
      chainPolicies={chainPolicies}
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
  const { state, sessionToken } = await openPopupAuth({
    action: "login",
    username: currentController.username(),
    preset: params.preset ?? undefined,
    rpcUrl: params.rpcUrl ?? undefined,
    policies: params.policiesStr ?? undefined,
    origin: params.origin ?? undefined,
  });

  if (sessionToken) {
    setBearerToken(sessionToken);
  }

  const controller = await Controller.importState(state);
  window.controller = controller;
  setController(controller);
}
