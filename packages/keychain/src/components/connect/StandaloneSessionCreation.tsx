import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SessionConsent } from "@/components/connect";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { now } from "@/constants";
import { useConnection } from "@/hooks/connection";
import { useCreateSession, hasApprovalPolicies } from "@/hooks/session";
import type { ControllerError } from "@/utils/connection";
import { safeRedirect } from "@/utils/url-validator";
import { restoreLocalStorageFromFragment } from "@/utils/storageSnapshot";
import {
  Button,
  Checkbox,
  cn,
  HeaderInner,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  SliderIcon,
} from "@cartridge/ui";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SpendingLimitPage } from "./SpendingLimitPage";
import { processPolicies } from "./CreateSession";
import Controller from "@/utils/controller";

/**
 * StandaloneSessionCreation component for creating sessions in standalone auth flow.
 * This is displayed after user returns from standalone authentication at keychain site.
 * Key differences from embedded CreateSession:
 * - Requests storage access via user gesture before creating session
 * - Displays username from URL parameter (no controller access yet)
 * - Redirects to redirect_url after session creation
 */
export function StandaloneSessionCreation({ username }: { username?: string }) {
  const [isConsent, setIsConsent] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<ControllerError | Error>();
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [searchParams] = useSearchParams();

  const { duration, isEditable, onToggleEditable } = useCreateSession();
  const { setController, theme, parent, closeModal, origin, policies } =
    useConnection();

  const redirectUrl = searchParams.get("redirect_url");

  const hasTokenApprovals = useMemo(
    () => hasApprovalPolicies(policies),
    [policies],
  );

  const defaultStep = useMemo<"summary" | "spending-limit">(() => {
    return policies?.verified && hasTokenApprovals
      ? "spending-limit"
      : "summary";
  }, [policies?.verified, hasTokenApprovals]);

  const [step, setStep] = useState<"summary" | "spending-limit">(defaultStep);

  useEffect(() => {
    setStep(defaultStep);
  }, [defaultStep]);

  const expiresAt = useMemo(() => {
    return duration + now();
  }, [duration]);

  const createSession = useCallback(
    async ({ toggleOff }: { toggleOff: boolean }) => {
      try {
        setError(undefined);
        setIsConnecting(true);

        await document.requestStorageAccess();

        // Restore localStorage from encrypted blob in URL fragment
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const encryptedBlob = hashParams.get("kc");

        if (encryptedBlob) {
          await restoreLocalStorageFromFragment(encryptedBlob, {
            clearAfterRestore: true,
          });
        } else {
          console.warn(
            "[Standalone Flow] No encrypted blob found in URL fragment",
          );
        }

        if (!policies) {
          console.error(
            "[Standalone Flow] StandaloneSessionCreation: Missing required data",
            { policies },
          );
          return;
        }

        const controller = await Controller.fromStore();
        if (!controller) {
          throw new Error("Controller not found");
        }

        window.controller = controller;
        setController(controller);

        // Create session (now we have storage access)
        const processedPolicies = processPolicies(policies, toggleOff);
        await controller.createSession(origin, expiresAt, processedPolicies);
        // Notify parent that session was created
        if (parent) {
          if (
            "onSessionCreated" in parent &&
            typeof parent.onSessionCreated === "function"
          ) {
            try {
              await parent.onSessionCreated();
            } catch (err) {
              console.error(
                "[Standalone Flow] StandaloneSessionCreation: Error notifying parent:",
                err,
              );
            }
          }

          if (closeModal) {
            closeModal();
          }
        }

        // Redirect back to application
        if (redirectUrl) {
          safeRedirect(redirectUrl, true);
        }
      } catch (e) {
        console.error(
          "[Standalone Flow] StandaloneSessionCreation: Session creation failed:",
          e,
        );
        setError(e as unknown as Error);
        setIsConnecting(false);
      }
    },
    [
      closeModal,
      policies,
      expiresAt,
      redirectUrl,
      parent,
      origin,
      setController,
    ],
  );

  const handlePrimaryAction = useCallback(async () => {
    if (!policies || isConnecting) {
      return;
    }

    if (!policies.verified && !isConsent) {
      setIsConsent(true);
      return;
    }

    if (hasTokenApprovals && step === "summary") {
      setStep("spending-limit");
      return;
    }

    await createSession({ toggleOff: false });
  }, [
    policies,
    isConnecting,
    isConsent,
    hasTokenApprovals,
    step,
    createSession,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        // If unverified and on the summary step without consent, check the consent box
        if (!policies?.verified && step === "summary" && !isConsent) {
          setIsConsent(true);
          return;
        }

        void handlePrimaryAction();
      }
    },
    [policies?.verified, step, isConsent, handlePrimaryAction],
  );

  // Add keyboard listener to the document
  useEffect(() => {
    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      handleKeyDown(e as unknown as React.KeyboardEvent);
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [handleKeyDown]);

  if (!policies) {
    return null;
  }

  if (hasTokenApprovals && step === "spending-limit") {
    return (
      <LayoutContainer>
        <NavigationHeader variant="hidden" forceShowClose />
        <SpendingLimitPage
          policies={policies}
          isConnecting={isConnecting}
          error={error}
          onBack={() => setStep("summary")}
          onConnect={() => {
            void handlePrimaryAction();
          }}
        />
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <NavigationHeader variant="hidden" forceShowClose />
      <HeaderInner
        className="pb-0"
        title={`Connect to ${theme.name || "Application"}`}
        description={username ? `Continue as ${username}` : undefined}
        right={
          !isEditable ? (
            <Button
              variant="icon"
              className="size-10 relative bg-background-200 hover:bg-background-300"
              onClick={onToggleEditable}
            >
              <SliderIcon
                color="white"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </Button>
          ) : undefined
        }
      />
      <LayoutContent className="pb-0">
        <SessionConsent isVerified={policies.verified} />
        {policies.verified ? (
          <VerifiedSessionSummary
            game={theme.name}
            contracts={policies.contracts}
            messages={policies.messages}
          />
        ) : (
          <UnverifiedSessionSummary
            game={theme?.name}
            contracts={policies.contracts}
            messages={policies.messages}
          />
        )}
      </LayoutContent>
      <LayoutFooter>
        {!policies?.verified && (
          <div
            className={cn(
              "flex items-center p-2 mb-3 mt-3 gap-2 border border-solid-primary rounded-md cursor-pointer text-destructive-100 bg-background-100",
              isConsent ? "border-background-200" : "border-destructive-100",
            )}
            onClick={() => !isConnecting && setIsConsent(!isConsent)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isConnecting) setIsConsent(!isConsent);
              }
            }}
          >
            <Checkbox
              variant="solid"
              size="sm"
              checked={isConsent}
              disabled={isConnecting}
              onCheckedChange={() => setIsConsent(!isConsent)}
              className="pointer-events-none !w-5 !h-5"
              style={{
                margin: "6px",
              }}
            />
            <h1 className="text-xs font-normal select-none">
              I agree to grant this application permission to execute the
              actions listed above.
            </h1>
          </div>
        )}

        {error && <ControllerErrorAlert className="mb-3" error={error} />}

        <div className="flex items-center gap-4">
          {!policies.verified && (
            <Button
              variant="secondary"
              onClick={async () => {
                await createSession({ toggleOff: true });
              }}
              disabled={isConnecting}
              className="px-8"
            >
              Skip
            </Button>
          )}
          <Button
            ref={createButtonRef}
            className={cn("flex-1", policies.verified && "w-full")}
            disabled={isConnecting || (!policies.verified && !isConsent)}
            isLoading={isConnecting}
            onClick={() => {
              void handlePrimaryAction();
            }}
          >
            create session
          </Button>
        </div>

        {!error && <div className="flex flex-col" />}
      </LayoutFooter>
    </LayoutContainer>
  );
}
