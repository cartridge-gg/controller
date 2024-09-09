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
import { ControllerError, ExecuteCtx } from "utils/connection";
import { num } from "starknet";
import { ErrorCode } from "@cartridge/account-wasm";
import { Funding } from "./Funding";
import { DeployController } from "./DeployController";

export const WEBAUTHN_GAS = 3300n;
export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function ConfirmTransaction() {
  const { controller, context, origin, paymaster } = useConnection();
  const ctx = context as ExecuteCtx;

  const [maxFee, setMaxFee] = useState<bigint>(0n);
  const [ctrlError, setCtrlError] = useState<ControllerError>(ctx.error);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [ctaState, setCTAState] = useState<"fund" | "deploy" | "execute">(
    "execute",
  );

  const account = controller.account;

  // Estimate fees
  useEffect(() => {
    if (!controller || !ctx.transactions || ctx.error) return;

    const estimateFees = async () => {
      try {
        const est = await account.estimateInvokeFee(
          ctx.transactions,
          ctx.transactionsDetail,
        );
        setMaxFee(est.overall_fee);
      } catch (e) {
        setCtrlError({
          code: e.code,
          message: e.message,
          data: e.data ? JSON.parse(e.data) : undefined,
        });
      }
    };

    estimateFees();
  }, [
    controller,
    account,
    ctx.transactions,
    ctx.transactionsDetail,
    ctx.error,
    setMaxFee,
    setCtrlError,
  ]);

  const execute = useCallback(async () => {
    if (!paymaster) {
      let { transaction_hash } = await account.execute(ctx.transactions, {
        maxFee: num.toHex(maxFee),
      });

      return transaction_hash;
    }

    try {
      return await account.executeFromOutside(ctx.transactions, paymaster);
    } catch (e) {
      let { transaction_hash } = await account.execute(ctx.transactions, {
        maxFee: num.toHex(maxFee),
      });

      return transaction_hash;
    }
  }, [account, ctx.transactions, paymaster, maxFee]);

  const onSubmit = useCallback(async () => {
    setLoading(true);

    try {
      let transaction_hash = await execute();
      ctx.resolve({
        code: ResponseCodes.SUCCESS,
        transaction_hash,
      });
    } catch (e) {
      setCtrlError({
        code: e.code,
        message: e.message,
        data: e.data ? JSON.parse(e.data) : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [ctx, execute]);

  const policies = useMemo<Policy[]>(
    () =>
      (Array.isArray(ctx.transactions)
        ? ctx.transactions
        : [ctx.transactions]
      ).map((c) => ({ target: c.contractAddress, method: c.entrypoint })),
    [ctx.transactions],
  );
  const feeEstimate: string = ctrlError?.data?.fee_estimate?.overall_fee;

  if (ctaState === "fund" && ctrlError.code === ErrorCode.InsufficientBalance) {
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
    ctrlError.code === ErrorCode.CartridgeControllerNotDeployed
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
        switch (ctrlError?.code) {
          case ErrorCode.CartridgeControllerNotDeployed:
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
          case ErrorCode.InsufficientBalance:
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
