import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { now } from "@/constants";
import { CreateSessionProvider } from "@/context/session";
import { useConnection } from "@/hooks/connection";
import {
  type ContractType,
  type ParsedSessionPolicies,
  useCreateSession,
  hasApprovalPolicies,
} from "@/hooks/session";
import type { ControllerError } from "@/utils/connection";
import {
  Button,
  Checkbox,
  cn,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SliderIcon,
} from "@cartridge/ui";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { SpendingLimitPage } from "./SpendingLimitPage";

const requiredPolicies: Array<ContractType> = ["VRF"];

export function CreateSession({
  policies,
  onConnect,
  onSkip,
  isUpdate,
}: {
  policies: ParsedSessionPolicies;
  onConnect: () => void;
  onSkip?: () => void;
  isUpdate?: boolean;
}) {
  return (
    <CreateSessionProvider
      initialPolicies={policies}
      requiredPolicies={requiredPolicies}
    >
      <CreateSessionLayout
        isUpdate={isUpdate}
        onConnect={onConnect}
        onSkip={onSkip}
      />
    </CreateSessionProvider>
  );
}

const CreateSessionLayout = ({
  isUpdate,
  onConnect,
  onSkip,
}: {
  isUpdate?: boolean;
  onConnect: () => void;
  onSkip?: () => void;
}) => {
  const [isConsent, setIsConsent] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<ControllerError | Error>();
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const { policies, duration, isEditable, onToggleEditable } =
    useCreateSession();

  const { controller, theme, origin } = useConnection();

  const hasTokenApprovals = useMemo(
    () => hasApprovalPolicies(policies),
    [policies],
  );

  const defaultStep = useMemo<"summary" | "spending-limit">(() => {
    // Only show spending limit page for verified sessions with token approvals
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
        successCallback?.();
      } catch (e) {
        setError(e as unknown as Error);
      } finally {
        setIsConnecting(false);
      }
    },
    [controller, policies, expiresAt, origin],
  );

  const handlePrimaryAction = useCallback(async () => {
    if (!policies || isConnecting) {
      return;
    }

    if (!policies.verified && !isConsent) {
      setIsConsent(true);
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
    hasTokenApprovals,
    step,
    createSession,
    onConnect,
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

  // Show SpendingLimitPage only for VERIFIED sessions with token approvals
  if (policies.verified && hasTokenApprovals && step === "spending-limit") {
    return (
      <SpendingLimitPage
        policies={policies}
        isConnecting={isConnecting}
        error={error}
        onBack={() => setStep("summary")}
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
          !isUpdate ? (theme ? theme.name : "Create Session") : "Update Session"
        }
        description={isUpdate ? "The policies were updated" : undefined}
        right={
          !isEditable ? (
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
              These contracts are not verified. I agree to grant this game
              permission to execute the actions listed above.
            </h1>
          </div>
        )}

        {error && <ControllerErrorAlert className="mb-3" error={error} />}

        <div className="flex items-center gap-3">
          {!policies.verified && (
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
            {isUpdate ? "update session" : "continue"}
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
};

/**
 * Deep copy the policies and remove the id fields
 * @param policies The policies to clean
 * @param toggleOff Optional. When true, sets all policies to unauthorized (false)
 */
export const processPolicies = (
  policies: ParsedSessionPolicies,
  toggleOff?: boolean,
): ParsedSessionPolicies => {
  // Deep copy the policies
  const processPolicies: ParsedSessionPolicies = JSON.parse(
    JSON.stringify(policies),
  );

  // Remove the id fields from the methods and optionally set authorized to false
  if (processPolicies.contracts) {
    Object.values(processPolicies.contracts).forEach((contract) => {
      contract.methods.forEach((method) => {
        delete method.id;
        if (toggleOff !== undefined) {
          method.authorized = !toggleOff;
        }
      });
    });
  }

  // Remove the id fields from the messages and optionally set authorized to false
  if (processPolicies.messages) {
    processPolicies.messages.forEach((message) => {
      delete message.id;
      if (toggleOff !== undefined) {
        message.authorized = !toggleOff;
      }
    });
  }

  // Return the cleaned policies
  return processPolicies;
};
