import { ControllerErrorAlert } from "#components/ErrorAlert";
import { SessionConsent } from "#components/connect";
import { Upgrade } from "#components/connect/Upgrade";
import { UnverifiedSessionSummary } from "#components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "#components/session/VerifiedSessionSummary";
import { NOW } from "#const";
import { CreateSessionProvider } from "#components/provider/session";
import { useConnection } from "#hooks/connection";
import {
  type ContractType,
  type ParsedSessionPolicies,
  useCreateSession,
} from "#hooks/session";
import type { ControllerError } from "#utils/connection";
import {
  Button,
  Checkbox,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  SliderIcon,
} from "@cartridge/ui-next";
import { useCallback, useMemo, useState } from "react";
import { type BigNumberish } from "starknet";
import { OcclusionDetector } from "#components/OcclusionDetector";
import { useUpgrade } from "#components/provider/upgrade";

const requiredPolicies: Array<ContractType> = ["VRF"];

export function CreateSession({
  policies,
  onConnect,
  isUpdate,
}: {
  policies: ParsedSessionPolicies;
  onConnect: (transaction_hash?: string, expiresAt?: bigint) => void;
  isUpdate?: boolean;
}) {
  return (
    <CreateSessionProvider
      initialPolicies={policies}
      requiredPolicies={requiredPolicies}
    >
      <CreateSessionLayout isUpdate={isUpdate} onConnect={onConnect} />
    </CreateSessionProvider>
  );
}

const CreateSessionLayout = ({
  isUpdate,
  onConnect,
}: {
  isUpdate?: boolean;
  onConnect: (transaction_hash?: string, expiresAt?: bigint) => void;
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
    return duration + NOW;
  }, [duration]);

  const onCreateSession = useCallback(async () => {
    if (!controller || !policies) return;
    try {
      setError(undefined);
      setIsConnecting(true);

      const processedPolicies = processPolicies(policies);

      await controller.createSession(expiresAt, processedPolicies, maxFee);
      onConnect();
    } catch (e) {
      setError(e as unknown as Error);
      setIsConnecting(false);
    }
  }, [controller, policies, maxFee, expiresAt, onConnect]);

  const onSkipSession = useCallback(async () => {
    if (!controller || !policies) return;
    try {
      setError(undefined);
      setIsConnecting(true);

      const processedPolicies = processPolicies(policies, true);
      await controller.createSession(duration, processedPolicies, maxFee);
      onConnect();
    } catch (e) {
      setError(e as unknown as Error);
      setIsConnecting(false);
    }
  }, [controller, duration, policies, maxFee, onConnect]);

  if (!upgrade.isSynced) {
    return <></>;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  return (
    <>
      <OcclusionDetector />
      <LayoutContainer>
        <LayoutHeader
          className="px-6 pt-6"
          title={!isUpdate ? "Create Session" : "Update Session"}
          description={
            isUpdate
              ? "The policies were updated, please update existing session"
              : undefined
          }
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
        <LayoutContent className="gap-6 px-6">
          <SessionConsent isVerified={policies?.verified} />
          {policies?.verified ? (
            <VerifiedSessionSummary
              game={theme.name}
              contracts={policies.contracts}
            />
          ) : (
            <UnverifiedSessionSummary contracts={policies.contracts} />
          )}
        </LayoutContent>
        <LayoutFooter>
          {!policies?.verified && (
            <div
              className="flex items-center p-3 mb-3 gap-5 border border-solid-primary rounded-md cursor-pointer border-destructive-100 text-destructive-100"
              onClick={() => !isConnecting && setIsConsent(!isConsent)}
            >
              <Checkbox
                variant="solid"
                checked={isConsent}
                disabled={isConnecting}
                onCheckedChange={() => setIsConsent(!isConsent)}
                className="pointer-events-none"
              />
              <div className="text-xs">
                I understand and agree to grant permission for this application
                to execute these actions.
              </div>
            </div>
          )}

          {error && <ControllerErrorAlert className="mb-3" error={error} />}

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={onSkipSession}
              disabled={isConnecting}
              className="px-8"
            >
              Skip
            </Button>
            <Button
              className="flex-1"
              disabled={isConnecting || (!policies?.verified && !isConsent)}
              isLoading={isConnecting}
              onClick={onCreateSession}
            >
              {isUpdate ? "update" : "create"} session
            </Button>
          </div>

          {!error && <div className="flex flex-col" />}
        </LayoutFooter>
      </LayoutContainer>
    </>
  );
};

/**
 * Deep copy the policies and remove the id fields
 * @param _policies The policies to clean
 * @param toggleOff Optional. When true, sets all policies to unauthorized (false)
 */
const processPolicies = (
  _policies: ParsedSessionPolicies,
  toggleOff?: boolean,
): ParsedSessionPolicies => {
  console.log(toggleOff);
  // Deep copy the policies
  const processPolicies: ParsedSessionPolicies = JSON.parse(
    JSON.stringify(_policies),
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
