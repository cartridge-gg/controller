import { Container, Content, Footer } from "components/layout";
import { BigNumberish, shortString } from "starknet";
import { ControllerError } from "utils/connection";
import { Button, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection } from "hooks/connection";
import { ControllerErrorAlert } from "components/ErrorAlert";
import { SessionConsent } from "components/connect";
import { DEFAULT_SESSION_DURATION } from "const";
import { Upgrade } from "./Upgrade";
import { ErrorCode } from "@cartridge/account-wasm";
import { SessionSummary } from "components/SessionSummary";
import { TypedDataPolicy } from "@cartridge/presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@cartridge/ui-next";

export function CreateSession({
  onConnect,
  isUpdate,
}: {
  onConnect: (transaction_hash?: string) => void;
  isUpdate?: boolean;
}) {
  const { controller, policies, upgrade, chainId, logout } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [duration, setDuration] = useState<bigint>(DEFAULT_SESSION_DURATION);
  const expiresAt = useMemo(
    () => duration + BigInt(Math.floor(Date.now() / 1000)),
    [duration],
  );
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<ControllerError | Error>();

  useEffect(() => {
    if (!chainId) return;
    const normalizedChainId = normalizeChainId(chainId);

    const violatingPolicy = policies.messages?.find(
      (policy: TypedDataPolicy) =>
        "domain" in policy &&
        (!policy.domain.chainId ||
          normalizeChainId(policy.domain.chainId) !== normalizedChainId),
    );

    if (violatingPolicy) {
      setError({
        code: ErrorCode.PolicyChainIdMismatch,
        message: `Policy for ${
          (violatingPolicy as TypedDataPolicy).domain.name
        }.${
          (violatingPolicy as TypedDataPolicy).primaryType
        } has mismatched chain ID.`,
      });
      setIsDisabled(true);
    } else {
      setError(undefined);
      setIsDisabled(false);
    }
  }, [chainId, policies]);

  const onCreateSession = useCallback(async () => {
    if (!controller) return;
    try {
      setError(undefined);
      setIsConnecting(true);
      await controller.createSession(expiresAt, policies, maxFee);
      onConnect();
    } catch (e) {
      setError(e as unknown as Error);
      setIsConnecting(false);
    }
  }, [controller, expiresAt, policies, maxFee, onConnect]);

  if (!upgrade.isSynced) {
    return <></>;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  return (
    <Container
      title={!isUpdate ? "Create Session" : "Update Session"}
      description={
        isUpdate
          ? "The policies were updated, please update existing session"
          : undefined
      }
      onClose={() => {
        if (!isUpdate) {
          logout();
        }
      }}
    >
      <Content gap={6}>
        <SessionConsent />
        <SessionSummary policies={policies} setError={setError} />
      </Content>

      <Footer>
        <Separator />
        {error && isControllerError(error) && (
          <ControllerErrorAlert error={error} />
        )}
        {!error && (
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-muted-foreground py-4 gap-2">
              <div className="font-medium">Expires in </div>
              <Select
                value={duration.toString()}
                onValueChange={(val) => setDuration(BigInt(val))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue
                    defaultValue={(60 * 60 * 24).toString()}
                    placeholder="1 HR"
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={(60 * 60).toString()}>1 HR</SelectItem>
                  <SelectItem value={(60 * 60 * 24).toString()}>
                    24 HRS
                  </SelectItem>
                  <SelectItem value={(60 * 60 * 24 * 7).toString()}>
                    1 WEEK
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <VStack spacing={4} width="full">
              <Button
                colorScheme="colorful"
                isDisabled={isDisabled || isConnecting}
                isLoading={isConnecting}
                onClick={() => onCreateSession()}
                width="full"
              >
                {isUpdate ? "update" : "create"} session
              </Button>
              <Button
                onClick={() => onConnect()}
                isDisabled={isConnecting}
                width="full"
              >
                Skip
              </Button>
            </VStack>
          </div>
        )}
      </Footer>
    </Container>
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

function isControllerError(
  error: ControllerError | Error,
): error is ControllerError {
  return !!(error as ControllerError).code;
}
