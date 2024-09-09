import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@chakra-ui/react";
import { Policy, ResponseCodes } from "@cartridge/controller";
import {
  Container,
  Content,
  FOOTER_MIN_HEIGHT,
  Footer,
} from "components/layout";
import { TransactionDuoIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { ControllerErrorAlert } from "components/ErrorAlert";
import { Policies } from "Policies";
import { Fees } from "./Fees";
import { ExecuteCtx } from "utils/connection";
import { num } from "starknet";
import { ErrorType, JsControllerError } from "@cartridge/account-wasm";
import { Funding } from "./Funding";
import { DeployController } from "./DeployController";

export const WEBAUTHN_GAS = 3300n;
export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function ConfirmTransaction() {
  const { controller, context, origin, paymaster } = useConnection();
  const ctx = context as ExecuteCtx;

  const [maxFee, setMaxFee] = useState<bigint>(0n);
  const [ctrlError, setCtrlError] = useState<JsControllerError>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [ctaState, setCTAState] = useState<"fund" | "deploy" | "execute">(
    "execute",
  );

  const account = controller.account;
  const calls = useMemo(() => {
    return Array.isArray(ctx.transactions)
      ? ctx.transactions
      : [ctx.transactions];
  }, [ctx.transactions]);

  // Estimate fees
  useEffect(() => {
    if (!controller || !calls) return;

    const estimateFees = async () => {
      try {
        const est = await account.estimateInvokeFee(
          calls,
          ctx.transactionsDetail,
        );
        setMaxFee(est.overall_fee);
      } catch (e) {
        setCtrlError(e);
      }
    };

    estimateFees();
  }, [controller, calls, account, ctx, setMaxFee]);

  const execute = useCallback(async () => {
    if (!paymaster) {
      let { transaction_hash } = await account.execute(calls, {
        maxFee: num.toHex(maxFee),
      });

      return transaction_hash;
    }

    try {
      return await account.executeFromOutside(calls, paymaster);
    } catch (e) {
      let { transaction_hash } = await account.execute(calls, {
        maxFee: num.toHex(maxFee),
      });

      return transaction_hash;
    }
  }, [account, calls, paymaster, maxFee]);

  const onSubmit = useCallback(async () => {
    setLoading(true);

    try {
      let transaction_hash = await execute();
      ctx.resolve({
        transaction_hash,
        code: ResponseCodes.SUCCESS,
      });
    } catch (error) {
      setCtrlError(error);
    } finally {
      setLoading(false);
    }
  }, [ctx, execute]);

  const policies = useMemo<Policy[]>(
    () =>
      calls.map((c) => ({ target: c.contractAddress, method: c.entrypoint })),
    [calls],
  );
  const details = ctrlError?.details ? JSON.parse(ctrlError?.details) : null;
  const feeEstimate: string = details?.fee_estimate.overall_fee;

  if (
    ctaState === "fund" &&
    ctrlError.error_type === ErrorType.InsufficientBalance
  ) {
    return (
      <Funding
        onComplete={() => {
          setCTAState("execute");
        }}
        defaultAmount={feeEstimate}
      />
    );
  }

  if (
    ctaState === "deploy" &&
    ctrlError.error_type === ErrorType.CartridgeControllerNotDeployed
  ) {
    return (
      <DeployController
        onClose={() => {
          setCTAState("execute");
        }}
        ctrlError={ctrlError}
      />
    );
  }

  return (
    <Container
      Icon={TransactionDuoIcon}
      title="Confirm Transaction"
      description={origin}
    >
      <Content pb={FOOTER_MIN_HEIGHT}>
        <Policies title="Transaction Details" policies={policies} />
      </Content>

      {(() => {
        switch (ctrlError?.error_type) {
          case ErrorType.CartridgeControllerNotDeployed:
            return (
              <Footer>
                <Fees maxFee={BigInt(feeEstimate)} variant="info" />
                <ControllerErrorAlert error={ctrlError} />
                <Button
                  colorScheme="colorful"
                  onClick={() => setCTAState("deploy")}
                >
                  DEPLOY ACCOUNT
                </Button>
              </Footer>
            );
          case ErrorType.InsufficientBalance:
            return (
              <Footer>
                <Fees maxFee={maxFee} variant="info" />

                <Button
                  colorScheme="colorful"
                  onClick={() => setCTAState("fund")}
                >
                  ADD FUNDS
                </Button>
              </Footer>
            );
          default:
            return (
              <Footer>
                {ctrlError ? (
                  <ControllerErrorAlert error={ctrlError} />
                ) : (
                  <Fees maxFee={maxFee} />
                )}

                <Button
                  colorScheme="colorful"
                  onClick={onSubmit}
                  isLoading={isLoading}
                  isDisabled={!maxFee}
                >
                  SUBMIT
                </Button>
              </Footer>
            );
        }
      })()}
    </Container>
  );
}
