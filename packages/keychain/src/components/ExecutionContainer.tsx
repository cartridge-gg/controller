import { useState, useCallback, useEffect, useRef } from "react";
import {
  Button,
  LayoutContainer,
  LayoutFooter,
  LayoutHeader,
} from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ControllerError } from "@/utils/connection";
import { ControllerErrorAlert, ErrorAlert } from "@/components/ErrorAlert";
import { ErrorCode } from "@cartridge/account-wasm/controller";
import { parseControllerError } from "@/utils/connection/execute";
import isEqual from "lodash/isEqual";

import { Fees } from "./Fees";
import { Funding } from "./funding";
import { DeployController } from "./DeployController";
import { Call, EstimateFee } from "starknet";
import { BannerProps } from "./layout/container/header/Banner";

interface ExecutionContainerProps {
  transactions: Call[];
  feeEstimate?: EstimateFee;
  executionError?: ControllerError;
  onSubmit: (maxFee?: EstimateFee) => Promise<void>;
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
  feeEstimate,
  executionError,
  onSubmit,
  onDeploy,
  onFund,
  onError,
  buttonText = "SUBMIT",
  children,
}: ExecutionContainerProps &
  Pick<BannerProps, "title" | "description" | "icon">) {
  const { controller, closeModal, chainId, openSettings } = useConnection();
  const [maxFee, setMaxFee] = useState<EstimateFee | undefined>(feeEstimate);
  const [ctrlError, setCtrlError] = useState<ControllerError | undefined>(
    executionError,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(true);
  const [ctaState, setCTAState] = useState<"fund" | "deploy" | "execute">(
    "execute",
  );

  // Prevent unnecessary estimate fee calls.
  const prevTransactionsRef = useRef<{
    transactions: Call[] | undefined;
    feeEstimate: EstimateFee | undefined;
  }>({
    transactions: undefined,
    feeEstimate: undefined,
  });

  const estimateFees = useCallback(
    async (transactions: Call[]) => {
      if (!controller) {
        return;
      }

      try {
        const est = await controller.estimateInvokeFee(transactions);
        setCtrlError(undefined);
        setMaxFee(est);
        setIsEstimating(false);
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
      isEqual(prevTransactionsRef.current.feeEstimate, feeEstimate)
    ) {
      return;
    }

    // Update ref with current values
    prevTransactionsRef.current = { transactions, feeEstimate };

    const estimateFeesAsync = async () => {
      await estimateFees(transactions);
    };

    estimateFeesAsync();
  }, [transactions, estimateFees]);

  useEffect(() => {
    setCtrlError(executionError);
  }, [executionError]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(maxFee);
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
    estimateFees(transactions);
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
    <LayoutContainer>
      <LayoutHeader
        title={title}
        description={description}
        icon={icon}
        onClose={closeModal}
        chainId={chainId}
        openSettings={openSettings}
      />
      {children}
      <LayoutFooter>
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
                    <Fees isLoading={isEstimating} maxFee={maxFee} />
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
                  {!ctrlError && (
                    <Fees isLoading={isEstimating} maxFee={maxFee} />
                  )}
                  <Button
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    disabled={
                      !!ctrlError ||
                      !transactions ||
                      !!(maxFee === null && transactions?.length)
                    }
                  >
                    {buttonText}
                  </Button>
                </>
              );
          }
        })()}
      </LayoutFooter>
    </LayoutContainer>
  );
}
