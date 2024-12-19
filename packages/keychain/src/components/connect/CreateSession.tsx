import { Container, Content, Footer } from "@/components/layout";
import { BigNumberish, shortString } from "starknet";
import { ControllerError } from "@/utils/connection";
import { Button, HStack, Text, Checkbox } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection } from "@/hooks/connection";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { SessionConsent } from "@/components/connect";
import { Upgrade } from "./Upgrade";
import { ErrorCode } from "@cartridge/account-wasm";
import { TypedDataPolicy } from "@cartridge/presets";
import { ParsedSessionPolicies } from "@/hooks/session";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { DEFAULT_SESSION_DURATION } from "@/const";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cartridge/ui-next";

export function CreateSession({
  policies,
  onConnect,
  isUpdate,
}: {
  policies: ParsedSessionPolicies;
  onConnect: (transaction_hash?: string) => void;
  isUpdate?: boolean;
}) {
  const { controller, upgrade, chainId, theme, logout } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isConsent, setIsConsent] = useState(false);
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
    if (!controller || !policies) return;
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
        <SessionConsent isVerified={policies?.verified} />
        {policies?.verified ? (
          <VerifiedSessionSummary game={theme.name} policies={policies} />
        ) : (
          <UnverifiedSessionSummary policies={policies} />
        )}
      </Content>
      <Footer>
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
              <SelectItem value={(60 * 60 * 24).toString()}>24 HRS</SelectItem>
              <SelectItem value={(60 * 60 * 24 * 7).toString()}>
                1 WEEK
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!policies?.verified && (
          <HStack
            p={3}
            mb={1}
            spacing={5}
            border="1px solid"
            borderRadius="md"
            borderColor="solid.primary"
            onClick={() => !isConnecting && setIsConsent(!isConsent)}
            cursor="pointer"
          >
            <Checkbox
              color="red"
              colorScheme="red"
              borderColor="error.foreground"
              isChecked={isConsent}
              isDisabled={isConnecting}
              pointerEvents="none"
            />
            <Text fontSize="xs" textColor="error.foreground">
              I understand and agree to grant permission for this application to
              execute these actions.
            </Text>
          </HStack>
        )}

        {error && isControllerError(error) && (
          <ControllerErrorAlert error={error} />
        )}

        <HStack spacing={4} width="full">
          <Button onClick={() => onConnect()} isDisabled={isConnecting} px={10}>
            Skip
          </Button>
          <Button
            colorScheme="colorful"
            isDisabled={
              isDisabled || isConnecting || (!policies?.verified && !isConsent)
            }
            isLoading={isConnecting}
            onClick={() => onCreateSession()}
            width="full"
          >
            {isUpdate ? "update" : "create"} session
          </Button>
        </HStack>

        {!error && <div className="flex flex-col"></div>}
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
