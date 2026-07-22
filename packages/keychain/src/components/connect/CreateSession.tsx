import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { now } from "@/constants";
import { CreateSessionProvider } from "@/context/session";
import { useConnection, type SessionChainPolicies } from "@/hooks/connection";
import type { MultichainSessionInput } from "@/utils/controller";
import { getChainName } from "@cartridge/controller-ui/utils";
import {
  type ContractType,
  type ParsedSessionPolicies,
  useCreateSession,
  hasApprovalPolicies,
} from "@/hooks/session";
import { processPolicies } from "@/utils/session/policies";
import { clampSessionDurationSeconds } from "@/utils/player-controls";
import type { ControllerError } from "@/utils/connection";
import {
  Button,
  Checkbox,
  cn,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SliderIcon,
} from "@cartridge/controller-ui";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { SpendingLimitPage } from "./SpendingLimitPage";
import { useNavigation } from "@/context/navigation";
import { posthog } from "@/components/provider/posthog";
import { captureAnalyticsEvent, sanitizeErrorCode } from "@/types/analytics";
import { useAdvancedView } from "@/hooks/features";

const requiredPolicies: Array<ContractType> = ["VRF"];

export function CreateSession({
  policies,
  chainPolicies,
  onConnect,
  onSkip,
  isUpdate,
  expiresAt: expiresAtOverride,
}: {
  policies: ParsedSessionPolicies;
  /** Multichain approval: one policy set per opted-in chain. */
  chainPolicies?: SessionChainPolicies;
  onConnect: () => void;
  onSkip?: () => void;
  isUpdate?: boolean;
  expiresAt?: bigint;
}) {
  return (
    <CreateSessionProvider
      initialPolicies={policies}
      requiredPolicies={requiredPolicies}
    >
      <CreateSessionLayout
        isUpdate={isUpdate}
        chainPolicies={chainPolicies}
        onConnect={onConnect}
        onSkip={onSkip}
        expiresAtOverride={expiresAtOverride}
      />
    </CreateSessionProvider>
  );
}

const CreateSessionLayout = ({
  isUpdate,
  chainPolicies,
  onConnect,
  onSkip,
  expiresAtOverride,
}: {
  isUpdate?: boolean;
  chainPolicies?: SessionChainPolicies;
  onConnect: () => void;
  onSkip?: () => void;
  expiresAtOverride?: bigint;
}) => {
  const [isConsent, setIsConsent] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<ControllerError | Error>();
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const { setOnBackCallback } = useNavigation();

  const {
    policies,
    duration,
    playTimeMaxDurationSeconds,
    isEditable,
    onToggleEditable,
  } = useCreateSession();

  const { controller, theme, origin } = useConnection();
  const advancedView = useAdvancedView();
  const sessionStartTime = useRef(performance.now());

  // Multichain sessions (explicit dapp opt-in): one approval screen covering
  // every opted-in chain, then one chain-bound signature per chain.
  const isMultichain = !!chainPolicies && chainPolicies.length > 0;
  // Chains still awaiting a session — repopulated with the failed subset when
  // a signature in the loop fails or is cancelled, so "retry" only re-signs
  // what's missing.
  const [pendingChains, setPendingChains] = useState<SessionChainPolicies>();
  const [signingProgress, setSigningProgress] = useState<{
    chainId: string;
    index: number;
    total: number;
  }>();

  const allChainsVerified = useMemo(
    () =>
      isMultichain
        ? chainPolicies!.every((c) => c.policies.verified)
        : !!policies?.verified,
    [isMultichain, chainPolicies, policies?.verified],
  );

  const hasTokenApprovals = useMemo(
    () => hasApprovalPolicies(policies),
    [policies],
  );

  const defaultStep = useMemo<"summary" | "spending-limit">(() => {
    // Only show spending limit page for verified sessions with token approvals.
    // Multichain approvals skip it: per-chain spending limits are not
    // supported yet, policies are signed as-is.
    return policies?.verified && hasTokenApprovals && !isMultichain
      ? "spending-limit"
      : "summary";
  }, [policies?.verified, hasTokenApprovals, isMultichain]);

  const [step, setStep] = useState<"summary" | "spending-limit">(defaultStep);

  useEffect(() => {
    setStep(defaultStep);
  }, [defaultStep]);

  // Track session requested once when policies are available
  const hasTrackedRequest = useRef(false);
  useEffect(() => {
    if (policies && !hasTrackedRequest.current) {
      hasTrackedRequest.current = true;
      captureAnalyticsEvent(posthog, "session_requested", {
        policy_count: policies.contracts
          ? Object.keys(policies.contracts).length
          : 0,
        has_spending_limits: hasTokenApprovals,
        verified: !!policies.verified,
      });
      sessionStartTime.current = performance.now();
    }
  }, [policies, hasTokenApprovals]);

  useEffect(() => {
    const callback = (): void => {
      setStep("summary");
    };
    // function state setters treat functions as updater callback, returning the actual value to store
    setOnBackCallback(() => (step === "spending-limit" ? callback : undefined));
    return () => {
      setOnBackCallback(undefined);
    };
  }, [step, setOnBackCallback]);

  const expiresAt = useMemo(() => {
    if (expiresAtOverride === undefined) return duration + now();
    // A caller-supplied expiry (e.g. the `/session?expires_at=` external
    // registration flow) bypasses the `duration` state entirely, so it must
    // be clamped here too — otherwise a dapp-requested expiry could exceed
    // the user's own play-time control cap.
    const requestedDuration = expiresAtOverride - now();
    return (
      clampSessionDurationSeconds(
        requestedDuration,
        playTimeMaxDurationSeconds,
      ) + now()
    );
  }, [expiresAtOverride, duration, playTimeMaxDurationSeconds]);

  const createSession = useCallback(
    async ({
      toggleOff,
      successCallback,
    }: {
      toggleOff: boolean;
      successCallback?: () => void;
    }) => {
      if (!controller || !policies) return;
      try {
        setError(undefined);
        setIsConnecting(true);

        const processedPolicies = processPolicies(policies, toggleOff);
        await controller.createSession(origin, expiresAt, processedPolicies);
        captureAnalyticsEvent(posthog, "session_approved", {
          policy_count: policies.contracts
            ? Object.keys(policies.contracts).length
            : 0,
          duration_ms: Math.round(performance.now() - sessionStartTime.current),
        });
        successCallback?.();
      } catch (e) {
        setError(e as unknown as Error);
        captureAnalyticsEvent(posthog, "session_register_failed", {
          error_code: sanitizeErrorCode(e),
        });
      } finally {
        setIsConnecting(false);
      }
    },
    [controller, policies, expiresAt, origin],
  );

  const createMultichainSession = useCallback(
    async ({ successCallback }: { successCallback?: () => void }) => {
      if (!controller || !chainPolicies) return;
      const chains = pendingChains ?? chainPolicies;
      try {
        setError(undefined);
        setIsConnecting(true);

        const inputs: MultichainSessionInput[] = chains.map((chain) => ({
          chainId: chain.chainId,
          rpcUrl: chain.rpcUrl,
          policies: processPolicies(chain.policies, false),
        }));

        const results = await controller.createMultichainSession(
          origin,
          expiresAt,
          inputs,
          (chainId, index, total) =>
            setSigningProgress({ chainId, index, total }),
        );

        const failed = results.filter((r) => r.error);
        if (failed.length > 0) {
          const failedIds = new Set(failed.map((r) => BigInt(r.chainId)));
          setPendingChains(
            chains.filter((c) => failedIds.has(BigInt(c.chainId))),
          );
          setError(failed[0].error);
          captureAnalyticsEvent(posthog, "session_register_failed", {
            error_code: sanitizeErrorCode(failed[0].error),
          });
          return;
        }

        setPendingChains(undefined);
        captureAnalyticsEvent(posthog, "session_approved", {
          policy_count: chainPolicies.reduce(
            (count, c) =>
              count +
              (c.policies.contracts
                ? Object.keys(c.policies.contracts).length
                : 0),
            0,
          ),
          chain_count: chainPolicies.length,
          duration_ms: Math.round(performance.now() - sessionStartTime.current),
        });
        successCallback?.();
      } catch (e) {
        setError(e as unknown as Error);
        captureAnalyticsEvent(posthog, "session_register_failed", {
          error_code: sanitizeErrorCode(e),
        });
      } finally {
        setIsConnecting(false);
        setSigningProgress(undefined);
      }
    },
    [controller, chainPolicies, pendingChains, expiresAt, origin],
  );

  const handlePrimaryAction = useCallback(async () => {
    if (!policies || isConnecting) {
      return;
    }

    if (!allChainsVerified && !isConsent) {
      setIsConsent(true);
      return;
    }

    if (isMultichain) {
      await createMultichainSession({ successCallback: onConnect });
      return;
    }

    // Only transition to spending limit page for VERIFIED sessions with token approvals
    if (policies.verified && hasTokenApprovals && step === "summary") {
      setStep("spending-limit");
      return;
    }

    await createSession({
      toggleOff: false,
      successCallback: onConnect,
    });
  }, [
    policies,
    isConnecting,
    isConsent,
    allChainsVerified,
    isMultichain,
    hasTokenApprovals,
    step,
    createSession,
    createMultichainSession,
    onConnect,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        // If unverified and on the summary step without consent, check the consent box
        if (!allChainsVerified && step === "summary" && !isConsent) {
          setIsConsent(true);
          return;
        }

        void handlePrimaryAction();
      }
    },
    [allChainsVerified, step, isConsent, handlePrimaryAction],
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

  // Show SpendingLimitPage only for VERIFIED sessions with token approvals
  if (policies.verified && hasTokenApprovals && step === "spending-limit") {
    return (
      <SpendingLimitPage
        policies={policies}
        isConnecting={isConnecting}
        error={error}
        onSkip={async () => {
          await createSession({
            toggleOff: true,
            successCallback: onSkip,
          });
        }}
        onConnect={() => {
          void handlePrimaryAction();
        }}
      />
    );
  }

  return (
    <>
      <HeaderInner
        className="pb-0"
        title={
          !isUpdate
            ? theme
              ? `Play ${theme.name}`
              : "Create Session"
            : "Update Session"
        }
        description={isUpdate ? "The policies were updated" : undefined}
        right={
          // Per-policy editing is not supported for multichain approvals yet.
          !isEditable && !isMultichain ? (
            <Button
              variant="icon"
              className="bg-background-150 hover:bg-background-200 w-auto h-auto p-1.5 text-foreground-300 hover:text-foreground"
              onClick={onToggleEditable}
            >
              <SliderIcon className="!w-5 !h-5" />
            </Button>
          ) : undefined
        }
      />
      <LayoutContent className="pb-0">
        {isMultichain ? (
          <div className="flex flex-col gap-4">
            {chainPolicies!.map((chain) => (
              <div key={chain.chainId} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase text-foreground-300">
                    {getChainName(chain.chainId)}
                  </h3>
                  {pendingChains &&
                    !pendingChains.some(
                      (c) => BigInt(c.chainId) === BigInt(chain.chainId),
                    ) && (
                      <span className="text-xs text-foreground-400">
                        session created
                      </span>
                    )}
                </div>
                {chain.policies.verified ? (
                  <VerifiedSessionSummary
                    game={theme.name}
                    contracts={chain.policies.contracts}
                    messages={chain.policies.messages}
                  />
                ) : (
                  <UnverifiedSessionSummary
                    game={theme?.name}
                    contracts={chain.policies.contracts}
                    messages={chain.policies.messages}
                  />
                )}
              </div>
            ))}
          </div>
        ) : policies.verified ? (
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
        {!allChainsVerified && (
          <div
            className={cn(
              "flex items-center p-2 mt-4 gap-2 border border-solid-primary rounded-md cursor-pointer text-destructive-100 bg-background-100",
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
              {advancedView
                ? "These contracts are not verified. I agree to grant this game permission to execute the actions listed above."
                : "These permissions are not verified. I agree to let this game perform the actions listed above."}
            </h1>
          </div>
        )}

        {error && <ControllerErrorAlert className="mb-3" error={error} />}

        {isConnecting && signingProgress && signingProgress.total > 1 && (
          <div className="mb-3 text-center text-xs text-foreground-300">
            {`Signing session ${signingProgress.index + 1}/${signingProgress.total} — ${getChainName(signingProgress.chainId)}`}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            ref={createButtonRef}
            className={cn("flex-1", allChainsVerified && "w-full")}
            disabled={isConnecting || (!allChainsVerified && !isConsent)}
            isLoading={isConnecting}
            onClick={() => {
              void handlePrimaryAction();
            }}
          >
            {pendingChains
              ? "retry remaining chains"
              : isUpdate
                ? "update session"
                : "continue"}
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await createSession({
                toggleOff: true,
                successCallback: onSkip,
              });
            }}
            disabled={isConnecting}
            className="px-8"
          >
            Skip
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
};

// Backwards compat: other modules import `processPolicies` from this component.
export { processPolicies };
