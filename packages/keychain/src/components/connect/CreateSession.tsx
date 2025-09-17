import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { SessionConsent } from "@/components/connect";
import { Upgrade } from "./Upgrade";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { now } from "@/constants";
import { CreateSessionProvider } from "@/context/session";
import { useConnection } from "@/hooks/connection";
import {
  type ContractType,
  type ParsedSessionPolicies,
  useCreateSession,
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
import { useCallback, useMemo, useState } from "react";
import { type BigNumberish } from "starknet";
// import { OcclusionDetector } from "../OcclusionDetector";
import { useUpgrade } from "../provider/upgrade";

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
  const [maxFee] = useState<BigNumberish>();

  const { policies, duration, isEditable, onToggleEditable } =
    useCreateSession();
  const { controller, theme } = useConnection();
  const upgrade = useUpgrade();

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
        await controller.createSession(expiresAt, processedPolicies, maxFee);
        successCallback?.();
      } catch (e) {
        setError(e as unknown as Error);
      } finally {
        setIsConnecting(false);
      }
    },
    [controller, policies, maxFee, expiresAt],
  );

  if (!upgrade.isSynced) {
    return <></>;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  return (
    <>
      {/* <OcclusionDetector /> */}
      <>
        <HeaderInner
          className="pb-0"
          title={!isUpdate ? "Create Session" : "Update Session"}
          description={isUpdate ? "The policies were updated" : undefined}
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
          <SessionConsent isVerified={policies?.verified} />
          {policies?.verified ? (
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
            <Button
              className="flex-1"
              disabled={isConnecting || (!policies?.verified && !isConsent)}
              isLoading={isConnecting}
              onClick={async () => {
                await createSession({
                  toggleOff: false,
                  successCallback: onConnect,
                });
              }}
            >
              {isUpdate ? "update" : "create"} session
            </Button>
          </div>

          {!error && <div className="flex flex-col" />}
        </LayoutFooter>
      </>
    </>
  );
};

/**
 * Deep copy the policies and remove the id fields
 * @param policies The policies to clean
 * @param toggleOff Optional. When true, sets all policies to unauthorized (false)
 */
const processPolicies = (
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
        if (toggleOff) {
          method.authorized = false;
        }
      });
    });
  }

  // Remove the id fields from the messages and optionally set authorized to false
  if (processPolicies.messages) {
    processPolicies.messages.forEach((message) => {
      delete message.id;
      if (toggleOff) {
        message.authorized = false;
      }
    });
  }

  // Return the cleaned policies
  return processPolicies;
};
