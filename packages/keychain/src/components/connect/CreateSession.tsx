import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { SessionConsent } from "@/components/connect";
import { isPolicyRequired } from "@/components/connect/create/utils";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { DEFAULT_SESSION_DURATION, NOW } from "@/const";
import { useConnection } from "@/hooks/connection";
import { CreateSessionProvider } from "@/hooks/session";
import type { ContractType, ParsedSessionPolicies } from "@/hooks/session";
import type { ControllerError } from "@/utils/connection";
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
import { type BigNumberish, shortString } from "starknet";
import { Upgrade } from "./Upgrade";

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
  const { controller, upgrade, theme } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isConsent, setIsConsent] = useState(false);
  const [duration, setDuration] = useState<bigint>(DEFAULT_SESSION_DURATION);
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<ControllerError | Error>();

  const [policyState, setPolicyState] = useState<ParsedSessionPolicies>(() => {
    // Set all contract policyState to authorized
    if (policies.contracts) {
      Object.keys(policies.contracts).forEach((address) => {
        if (policies.contracts![address]) {
          policies.contracts![address].methods.forEach((method, i) => {
            method.id = `${i}-${address}-${method.name}`;
            method.authorized = true;

            // If policy type is required, set the method as required(always true)
            if (
              isPolicyRequired({
                requiredPolicyTypes: requiredPolicies,
                policyType: policies.contracts![address].meta?.type,
              })
            ) {
              method.isRequired = true;
            }
          });
        }
      });
    }

    // Set all message policyState to authorized
    if (policies.messages) {
      policies.messages.forEach((message, i) => {
        message.id = `${i}-${message.domain.name}-${message.name}`;
        message.authorized = true;
      });
    }

    return policies;
  });

  const handleToggleMethod = useCallback(
    (address: string, id: string, authorized: boolean) => {
      if (!policyState.contracts) return;
      const contract = policyState.contracts[address];
      if (!contract) return;
      const method = contract.methods.find((method) => method.id === id);
      if (!method) return;
      method.authorized = authorized;
      setPolicyState({ ...policyState });
    },
    [policyState],
  );

  const handleToggleMessage = useCallback(
    (id: string, authorized: boolean) => {
      if (!policyState.messages) return;
      const message = policyState.messages.find((message) => message.id === id);
      if (!message) return;
      message.authorized = authorized;
      setPolicyState({ ...policyState });
    },
    [policyState],
  );

  const handleToggleEditable = useCallback(() => {
    setIsEditable(!isEditable);
  }, [isEditable]);

  const expiresAt = useMemo(() => {
    return duration + NOW;
  }, [duration]);

  const chainSpecificMessages = useMemo(() => {
    if (!policyState.messages || !controller) return [];
    return policyState.messages.filter((message) => {
      return (
        !("domain" in message) ||
        (message.domain.chainId &&
          normalizeChainId(message.domain.chainId) ===
            normalizeChainId(controller.chainId()))
      );
    });
  }, [policyState.messages, controller]);

  const onCreateSession = useCallback(async () => {
    if (!controller || !policyState) return;
    try {
      setError(undefined);
      setIsConnecting(true);

      const cleanedPolicies = cleanPolicies(policyState);

      await controller.createSession(expiresAt, cleanedPolicies, maxFee);
      onConnect();
    } catch (e) {
      setError(e as unknown as Error);
      setIsConnecting(false);
    }
  }, [controller, policyState, maxFee, onConnect, expiresAt]);

  const onSkipSession = useCallback(async () => {
    if (!controller || !policyState) return;
    try {
      setError(undefined);
      setIsConnecting(true);

      const cleanedPolicies = cleanPolicies(policyState);

      await controller.createSession(duration, cleanedPolicies, maxFee);
      onConnect();
    } catch (e) {
      setError(e as unknown as Error);
      setIsConnecting(false);
    }
  }, [controller, duration, policyState, maxFee, onConnect]);

  if (!upgrade.isSynced) {
    return <></>;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  return (
    <CreateSessionProvider
      value={{
        policies: policyState,
        onToggleMethod: handleToggleMethod,
        onToggleMessage: handleToggleMessage,
        isEditable,
      }}
    >
      <LayoutContainer>
        <LayoutHeader
          className="px-6"
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
                className="size-10 relative bg-background-200"
                onClick={handleToggleEditable}
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
          <SessionConsent isVerified={policyState?.verified} />
          {policyState?.verified ? (
            <VerifiedSessionSummary
              game={theme.name}
              contracts={policyState.contracts}
              messages={chainSpecificMessages}
              duration={duration}
              onDurationChange={setDuration}
            />
          ) : (
            <UnverifiedSessionSummary
              contracts={policyState.contracts}
              messages={chainSpecificMessages}
              duration={duration}
              onDurationChange={setDuration}
            />
          )}
        </LayoutContent>
        <LayoutFooter>
          {!policyState?.verified && (
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
              disabled={isConnecting || (!policyState?.verified && !isConsent)}
              isLoading={isConnecting}
              onClick={onCreateSession}
            >
              {isUpdate ? "update" : "create"} session
            </Button>
          </div>

          {!error && <div className="flex flex-col"></div>}
        </LayoutFooter>
      </LayoutContainer>
    </CreateSessionProvider>
  );
}

function normalizeChainId(chainId: number | string): string {
  if (typeof chainId === "number") {
    return `0x${chainId.toString(16)}`;
  } else {
    if (chainId.startsWith("0x")) {
      return chainId;
    } else {
      return shortString.encodeShortString(chainId);
    }
  }
}

/**
 * Deep copy the policies and remove the id fields
 */
const cleanPolicies = (
  _policies: ParsedSessionPolicies,
): ParsedSessionPolicies => {
  // Deep copy the policies
  const cleanPolicies: ParsedSessionPolicies = JSON.parse(
    JSON.stringify(_policies),
  );

  // Remove the id fields from the methods
  if (cleanPolicies.contracts) {
    Object.values(cleanPolicies.contracts).forEach((contract) => {
      contract.methods.forEach((method) => {
        delete method.id;
      });
    });
  }

  // Remove the id fields from the messages
  if (cleanPolicies.messages) {
    cleanPolicies.messages.forEach((message) => {
      delete message.id;
    });
  }

  // Return the cleaned policies
  return cleanPolicies;
};
