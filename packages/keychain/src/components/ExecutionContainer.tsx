import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@cartridge/ui-next";
import { Container, Footer } from "@/components/layout";
import { useConnection } from "@/hooks/connection";
import { ControllerError } from "@/utils/connection";
import { ControllerErrorAlert, ErrorAlert } from "@/components/ErrorAlert";
import { Fees } from "./Fees";
import { Funding } from "./funding";
import { DeployController } from "./DeployController";
import { ErrorCode } from "@cartridge/account-wasm/controller";
import { BannerProps } from "./layout/container/header/Banner";
import { parseControllerError } from "@/utils/connection/execute";
import isEqual from "lodash/isEqual";

interface ExecutionContainerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionsDetail?: any;
  executionError?: ControllerError;
  onSubmit: (maxFee?: bigint) => Promise<void>;
  onDeploy?: () => void;
  onFund?: () => void;
  onError?: (error: ControllerError) => void;
  buttonText?: string;
  children: React.ReactNode;
}

export function ExecutionContainer({
  title,
  description,
  icon,
  transactions,
  transactionsDetail,
  executionError,
  onSubmit,
  onDeploy,
  onFund,
  onError,
  buttonText = "SUBMIT",
  children,
}: ExecutionContainerProps &
  Pick<BannerProps, "title" | "description" | "icon">) {
  const { controller } = useConnection();
  const [maxFee, setMaxFee] = useState<bigint | null>(null);
  const [ctrlError, setCtrlError] = useState<ControllerError | undefined>(
    executionError,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [ctaState, setCTAState] = useState<"fund" | "deploy" | "execute">(
    "execute",
  );

  // Prevent unnecessary estimate fee calls.
  const prevTransactionsRef = useRef({
    transactions: undefined,
    transactionsDetail: undefined,
  });

  const estimateFees = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (transactions: any, transactionsDetail?: any) => {
      if (!controller) {
        return;
      }
      try {
        const est = await controller.estimateInvokeFee(
          transactions,
          transactionsDetail,
        );
        setCtrlError(undefined);
        setMaxFee(est.suggestedMaxFee);
      } catch (e) {
        const error = parseControllerError(e as unknown as ControllerError);
        onError?.(error);
        setCtrlError(error);
      }
    },
    [controller, onError, setCtrlError],
  );

  useEffect(() => {
    if (!transactions?.length) {
      return;
    }

    // Only estimate if transactions or details have changed
    if (
      isEqual(prevTransactionsRef.current.transactions, transactions) &&
      isEqual(
        prevTransactionsRef.current.transactionsDetail,
        transactionsDetail,
      )
    ) {
      return;
    }

    // Update ref with current values
    prevTransactionsRef.current = { transactions, transactionsDetail };

    const estimateFeesAsync = async () => {
      await estimateFees(transactions, transactionsDetail);
    };

    estimateFeesAsync();
  }, [transactions, transactionsDetail, estimateFees]);

  useEffect(() => {
    setCtrlError(executionError);
  }, [executionError]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(maxFee === null ? undefined : maxFee);
    } catch (e) {
      const error = parseControllerError(e as unknown as ControllerError);
      onError?.(error);
      setCtrlError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setCTAState("execute");
    setCtrlError(undefined);
    setIsLoading(false);
    estimateFees(transactions, transactionsDetail);
  };

  if (
    ctaState === "fund" &&
    ctrlError?.code === ErrorCode.InsufficientBalance
  ) {
    return (
      <Funding
        onComplete={() => {
          resetState();
          onFund?.();
        }}
      />
    );
  }

  if (
    ctaState === "deploy" &&
    ctrlError?.code === ErrorCode.CartridgeControllerNotDeployed
  ) {
    return (
      <DeployController
        onClose={() => {
          resetState();
          onDeploy?.();
        }}
        ctrlError={ctrlError}
      />
    );
  }

  return (
    <Container title={title} description={description} icon={icon}>
      {children}
      <Footer>
        {(() => {
          switch (ctrlError?.code) {
            case ErrorCode.CartridgeControllerNotDeployed:
              return (
                <>
                  <ControllerErrorAlert error={ctrlError} />
                  <Button onClick={() => setCTAState("deploy")}>
                    DEPLOY ACCOUNT
                  </Button>
                </>
              );
            case ErrorCode.InsufficientBalance:
              return (
                <>
                  {ctrlError ? (
                    <ControllerErrorAlert error={ctrlError} />
                  ) : (
                    maxFee && <Fees maxFee={BigInt(maxFee)} />
                  )}
                  <Button onClick={() => setCTAState("fund")}>ADD FUNDS</Button>
                </>
              );
            case ErrorCode.SessionAlreadyRegistered:
              return (
                <>
                  <ErrorAlert
                    variant="info"
                    title="Session Already Registered"
                  />
                  <Button
                    onClick={() => onSubmit()}
                    isLoading={false}
                    data-testid="continue-button"
                  >
                    CONTINUE
                  </Button>
                </>
              );
            default:
              return (
                <>
                  {ctrlError && <ControllerErrorAlert error={ctrlError} />}
                  {maxFee !== null && <Fees maxFee={BigInt(maxFee)} />}
                  <Button
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    disabled={
                      ctrlError ||
                      !transactions ||
                      (maxFee === null && transactions?.length)
                    }
                  >
                    {buttonText}
                  </Button>
                </>
              );
          }
        })()}
      </Footer>
    </Container>
  );
}
