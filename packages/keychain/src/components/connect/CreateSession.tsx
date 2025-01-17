import { BigNumberish, shortString } from "starknet";
import { ControllerError } from "@/utils/connection";
import { useCallback, useMemo, useState } from "react";
import { useConnection } from "@/hooks/connection";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { SessionConsent } from "@/components/connect";
import { Upgrade } from "./Upgrade";
import { ParsedSessionPolicies } from "@/hooks/session";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { DEFAULT_SESSION_DURATION, NOW } from "@/const";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  Button,
  Checkbox,
  LayoutHeader,
} from "@cartridge/ui";

export function CreateSession({
  policies,
  onConnect,
  isUpdate,
}: {
  policies: ParsedSessionPolicies;
  onConnect: (transaction_hash?: string, expiresAt?: bigint) => void;
  isUpdate?: boolean;
}) {
  const { closeModal, controller, upgrade, chainId, theme } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConsent, setIsConsent] = useState(false);
  const [duration, setDuration] = useState<bigint>(DEFAULT_SESSION_DURATION);
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<ControllerError | Error>();
  const expiresAt = useMemo(() => {
    return duration + NOW;
  }, [duration]);

  const chainSpecificMessages = useMemo(() => {
    if (!policies.messages || !chainId) return [];
    return policies.messages.filter((message) => {
      return (
        !("domain" in message) ||
        (message.domain.chainId &&
          normalizeChainId(message.domain.chainId) ===
            normalizeChainId(chainId))
      );
    });
  }, [policies.messages, chainId]);

  const onCreateSession = useCallback(async () => {
    if (!controller || !policies) return;
    try {
      setError(undefined);
      setIsConnecting(true);

      // Set all contract policies to authorized
      if (policies.contracts) {
        Object.keys(policies.contracts).forEach((address) => {
          if (policies.contracts![address]) {
            policies.contracts![address].methods.forEach((method) => {
              method.authorized = true;
            });
          }
        });
      }

      // Set all message policies to authorized
      if (policies.messages) {
        policies.messages.forEach((message) => {
          message.authorized = true;
        });
      }

      await controller.createSession(expiresAt, policies, maxFee);
      onConnect();
    } catch (e) {
      setError(e as unknown as Error);
      setIsConnecting(false);
    }
  }, [controller, duration, policies, maxFee, onConnect]);

  const onSkipSession = useCallback(async () => {
    if (!controller || !policies) return;
    try {
      setError(undefined);
      setIsConnecting(true);
      await controller.createSession(duration, policies, maxFee);
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
    <LayoutContainer>
      <LayoutHeader
        title={!isUpdate ? "Create Session" : "Update Session"}
        description={
          isUpdate
            ? "The policies were updated, please update existing session"
            : undefined
        }
        onClose={closeModal}
        chainId={chainId}
      />
      <LayoutContent className="gap-6">
        <SessionConsent isVerified={policies?.verified} />
        {policies?.verified ? (
          <VerifiedSessionSummary
            game={theme.name}
            contracts={policies.contracts}
            messages={chainSpecificMessages}
            duration={duration}
            onDurationChange={setDuration}
          />
        ) : (
          <UnverifiedSessionSummary
            contracts={policies.contracts}
            messages={chainSpecificMessages}
            duration={duration}
            onDurationChange={setDuration}
          />
        )}
      </LayoutContent>
      <LayoutFooter>
        {!policies?.verified && (
          <div
            className="flex items-center p-3 mb-3 gap-5 border border-solid-primary rounded-md cursor-pointer border-destructive-foreground text-destructive-foreground"
            onClick={() => !isConnecting && setIsConsent(!isConsent)}
          >
            <Checkbox
              checked={isConsent}
              disabled={isConnecting}
              onCheckedChange={() => setIsConsent(!isConsent)}
              className="pointer-events-none"
            />
            <div className="text-xs">
              I understand and agree to grant permission for this application to
              execute these actions.
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

        {!error && <div className="flex flex-col"></div>}
      </LayoutFooter>
    </LayoutContainer>
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
