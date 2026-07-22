import { ExecutionContainer } from "@/components/ExecutionContainer";
import { SessionConsent } from "@/components/connect";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { now } from "@/constants";
import { CreateSessionProvider } from "@/context/session";
import { useConnection, type SessionChainPolicies } from "@/hooks/connection";
import {
  type ContractType,
  type ParsedSessionPolicies,
  useCreateSession,
} from "@/hooks/session";
import { getChainName } from "@cartridge/controller-ui/utils";
import { Button, LayoutContent, SliderIcon } from "@cartridge/controller-ui";
import { clampSessionDurationSeconds } from "@/utils/player-controls";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Call,
  type FeeEstimate,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";

const requiredPolicies: Array<ContractType> = ["VRF"];

export function RegisterSession({
  policies,
  chainPolicies,
  onConnect,
  publicKey,
  expiresAt: expiresAtOverride,
}: {
  policies: ParsedSessionPolicies;
  /** Multichain registration: one policy set per opted-in chain. */
  chainPolicies?: SessionChainPolicies;
  onConnect: (transaction_hash: string, expiresAt: bigint) => void;
  publicKey?: string;
  expiresAt?: bigint;
}) {
  return (
    <CreateSessionProvider
      initialPolicies={policies}
      requiredPolicies={requiredPolicies}
    >
      <RegisterSessionLayout
        chainPolicies={chainPolicies}
        onConnect={onConnect}
        publicKey={publicKey}
        expiresAtOverride={expiresAtOverride}
      />
    </CreateSessionProvider>
  );
}

const RegisterSessionLayout = ({
  chainPolicies,
  onConnect,
  publicKey,
  expiresAtOverride,
}: {
  chainPolicies?: SessionChainPolicies;
  onConnect: (transaction_hash: string, expiresAt: bigint) => void;
  publicKey?: string;
  expiresAtOverride?: bigint;
}) => {
  const { policies } = useCreateSession();
  const { controller, theme, origin, isAppchain, chainId } = useConnection();
  const [transactions, setTransactions] = useState<Call[] | undefined>(
    undefined,
  );
  const [registeringChain, setRegisteringChain] = useState<string>();

  const { duration, playTimeMaxDurationSeconds, isEditable, onToggleEditable } =
    useCreateSession();

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

  useEffect(() => {
    if (!publicKey || !controller) {
      setTransactions(undefined);
    } else {
      controller
        .registerSessionCalldata(expiresAt, policies, publicKey)
        .then((calldata) => {
          setTransactions([
            {
              contractAddress: controller.address(),
              entrypoint: "register_session",
              calldata,
            },
          ]);
        });
    }
  }, [controller, expiresAt, policies, publicKey]);

  const onRegisterSession = useCallback(
    async (maxFee?: FeeEstimate) => {
      // On appchains a fee estimate may be unavailable up front (e.g. the fee
      // check failed on funds); submit anyway and let the wasm estimate
      // internally — mirrors ConfirmTransaction.
      if ((maxFee === undefined && !isAppchain) || !publicKey || !controller) {
        return;
      }

      const { transaction_hash } = await controller.registerSession(
        origin,
        expiresAt,
        policies,
        publicKey,
        maxFee,
      );

      await controller.provider.waitForTransaction(transaction_hash, {
        retryInterval: 1000,
        successStates: [
          TransactionExecutionStatus.SUCCEEDED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      });

      // Multichain registration: after the active chain, register on every
      // other opted-in chain. Already-registered chains count as success, so
      // resubmitting after a partial failure only retries what's missing.
      if (chainPolicies?.length) {
        const otherChains = chainPolicies.filter(
          (chain) => !chainId || BigInt(chain.chainId) !== BigInt(chainId),
        );
        if (otherChains.length > 0) {
          try {
            const results = await controller.registerSessionOnChains(
              origin,
              expiresAt,
              otherChains.map((chain) => ({
                chainId: chain.chainId,
                rpcUrl: chain.rpcUrl,
                policies: chain.policies,
              })),
              publicKey,
              (registeringChainId) =>
                setRegisteringChain(getChainName(registeringChainId)),
            );
            const failed = results.filter((r) => r.error);
            if (failed.length > 0) {
              throw failed[0].error;
            }
          } finally {
            setRegisteringChain(undefined);
          }
        }
      }

      onConnect(transaction_hash, expiresAt);
    },
    [
      controller,
      expiresAt,
      policies,
      chainPolicies,
      chainId,
      publicKey,
      onConnect,
      origin,
      isAppchain,
    ],
  );

  if (!transactions) {
    return <div>Loading</div>;
  }

  return (
    <ExecutionContainer
      title="Register Session"
      transactions={transactions}
      onSubmit={onRegisterSession}
      buttonText={
        registeringChain
          ? `Registering on ${registeringChain}…`
          : "Register Session"
      }
      right={
        !isEditable ? (
          <Button
            variant="icon"
            className="size-10 relative bg-background-200"
            onClick={onToggleEditable}
          >
            <SliderIcon
              color="white"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </Button>
        ) : undefined
      }
    >
      <LayoutContent>
        <SessionConsent isVerified={policies?.verified} />
        {chainPolicies?.length ? (
          <div className="flex flex-col gap-4">
            {chainPolicies.map((chain) => (
              <div key={chain.chainId} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase text-foreground-300">
                  {getChainName(chain.chainId)}
                </h3>
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
        ) : policies?.verified ? (
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
    </ExecutionContainer>
  );
};
