import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SessionConsent } from "@/components/connect";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { now } from "@/constants";
import { CreateSessionProvider } from "@/context/session";
import { useConnection } from "@/hooks/connection";
import {
  type ContractType,
  useCreateSession,
  hasApprovalPolicies,
} from "@/hooks/session";
import type { ControllerError } from "@/utils/connection";
import { requestStorageAccessFactory } from "@/utils/connection/storage-access";
import { safeRedirect } from "@/utils/url-validator";
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

const requiredPolicies: Array<ContractType> = ["VRF"];

/**
 * StandaloneSessionCreation component for creating sessions in standalone auth flow.
 * This is displayed after user returns from standalone authentication at keychain site.
 * Key differences from embedded CreateSession:
 * - Requests storage access via user gesture before creating session
 * - Displays username from URL parameter (no controller access yet)
 * - Redirects to redirect_url after session creation
 */
export function StandaloneSessionCreation({ username }: { username?: string }) {
  const { policies } = useConnection();

  if (!policies) {
    return null;
  }

  return (
    <CreateSessionProvider
      initialPolicies={policies}
      requiredPolicies={requiredPolicies}
    >
      <StandaloneSessionCreationLayout username={username} />
    </CreateSessionProvider>
  );
}

const StandaloneSessionCreationLayout = ({
  username,
}: {
  username?: string;
}) => {
  const [isConsent, setIsConsent] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<ControllerError | Error>();
  const [hasAutoApproved, setHasAutoApproved] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [searchParams] = useSearchParams();

  const { policies, duration, isEditable, onToggleEditable } =
    useCreateSession();
  const { controller, theme, parent, closeModal } = useConnection();

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

  // Auto-approve verified presets without token approvals
  useEffect(() => {
    if (
      !controller ||
      !policies ||
      !redirectUrl ||
      hasAutoApproved ||
      isConnecting
    ) {
      return;
    }

    // Only auto-approve verified presets without token approvals
    if (policies.verified && !hasTokenApprovals) {
      setHasAutoApproved(true);

      const autoCreateSession = async () => {
        try {
          setIsConnecting(true);
          console.log(
            "[Standalone Flow] StandaloneSessionCreation: Auto-approving verified preset",
          );

          // Request storage access first
          const requestStorageAccess = requestStorageAccessFactory();
          const granted = await requestStorageAccess();

          if (!granted) {
            throw new Error("Storage access was not granted");
          }

          // Create session with verified policies
          const processedPolicies = processPolicies(policies, false);
          await controller.createSession(expiresAt, processedPolicies);

          // Notify parent
          if (
            parent &&
            "onSessionCreated" in parent &&
            typeof parent.onSessionCreated === "function"
          ) {
            await parent.onSessionCreated();
          }

          // Redirect back to application
          if (redirectUrl) {
            safeRedirect(redirectUrl, true);
          }
        } catch (err) {
          console.error(
            "[Standalone Flow] StandaloneSessionCreation: Auto-approval failed:",
            err,
          );
          setError(err as Error);
          setIsConnecting(false);
        }
      };

      void autoCreateSession();
    }
  }, [
    controller,
    policies,
    redirectUrl,
    hasAutoApproved,
    isConnecting,
    hasTokenApprovals,
    expiresAt,
    parent,
  ]);

  const createSession = useCallback(
    async ({ toggleOff }: { toggleOff: boolean }) => {
      if (!controller || !policies) {
        console.error(
          "[Standalone Flow] StandaloneSessionCreation: Missing required data",
          { controller: !!controller, policies: !!policies },
        );
        return;
      }

      try {
        setError(undefined);
        setIsConnecting(true);

        // Request storage access (user gesture!)
        const requestStorageAccess = requestStorageAccessFactory();
        const granted = await requestStorageAccess();

        if (!granted) {
          throw new Error("Storage access was not granted");
        }

        // Create session (now we have storage access)
        const processedPolicies = processPolicies(policies, toggleOff);
        await controller.createSession(expiresAt, processedPolicies);

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
    [closeModal, controller, policies, expiresAt, redirectUrl, parent],
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
};
