import { Container, Content, Footer } from "components/layout";
import { BigNumberish, shortString } from "starknet";
import { ControllerError } from "utils/connection";
import { Button } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useConnection } from "hooks/connection";
import { ControllerErrorAlert } from "components/ErrorAlert";
import { SessionConsent } from "components/connect";
import { SESSION_EXPIRATION } from "const";
import { Upgrade } from "./Upgrade";
import { TypedDataPolicy } from "@cartridge/controller";
import { ErrorCode } from "@cartridge/account-wasm";
import { SessionSummary } from "components/SessionSummary";

export function CreateSession({
  onConnect,
  isUpdate,
}: {
  onConnect: (transaction_hash?: string) => void;
  isUpdate?: boolean;
}) {
  const { controller, policies, upgrade, chainId } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [expiresAt] = useState<bigint>(SESSION_EXPIRATION);
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<ControllerError>();

  useEffect(() => {
    const normalizedChainId = normalizeChainId(chainId);

    const violatingPolicy = policies.find(
      (policy) =>
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
    try {
      setError(undefined);
      setIsConnecting(true);
      await controller.createSession(expiresAt, policies, maxFee);
      onConnect();
    } catch (e) {
      setError(e);
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
        isUpdate && "The policies were updated, please update existing session"
      }
    >
      <Content gap={6}>
        <SessionConsent />
        <SessionSummary policies={policies} />
      </Content>

      <Footer>
        {error && <ControllerErrorAlert error={error} />}
        <Button
          colorScheme="colorful"
          isDisabled={isDisabled || isConnecting}
          isLoading={isConnecting}
          onClick={() => onCreateSession()}
        >
          {isUpdate ? "update" : "create"} session
        </Button>
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
