import { ControllerErrorAlert, ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import type { ControllerError } from "@/utils/connection";
import { parseControllerError } from "@/utils/connection/execute";
import { ErrorCode } from "@cartridge/account-wasm/controller";
import {
  Button,
  cn,
  type HeaderProps,
  LayoutContainer,
  LayoutFooter,
  LayoutHeader,
  PaperPlaneIcon,
  useUI,
} from "@cartridge/ui-next";
import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Call, EstimateFee } from "starknet";
import { DeployController } from "./DeployController";
import { Fees } from "./Fees";
import { Funding } from "./funding";
// import { OcclusionDetector } from "@/components/OcclusionDetector";

interface ExecutionContainerProps {
  transactions: Call[];
  feeEstimate?: EstimateFee;
  executionError?: ControllerError;
  onSubmit: (maxFee?: EstimateFee) => Promise<void>;
  onDeploy?: () => void;
  onFund?: () => void;
  onClose?: () => void;
  onError?: (error: ControllerError) => void;
  buttonText?: string;
  children: React.ReactNode;
  right?: React.ReactElement;
  className?: string;
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
  onClose,
  buttonText = "SUBMIT",
  right,
  children,
  className,
}: ExecutionContainerProps &
  Pick<HeaderProps, "title" | "description" | "icon">) {
  const { controller } = useConnection();
  const [maxFee, setMaxFee] = useState<EstimateFee | undefined>(feeEstimate);
  const [ctrlError, setCtrlError] = useState<ControllerError | undefined>(
    executionError,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(true);
  const [ctaState, setCTAState] = useState<"fund" | "deploy" | "execute">(
    "execute",
  );

  const { closeModal } = useUI();

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
        const maxFee = await controller.estimateInvokeFee(transactions);
        setCtrlError(undefined);
        setMaxFee(maxFee);
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
    (ctrlError?.code === ErrorCode.InsufficientBalance ||
      (ctrlError?.code === ErrorCode.StarknetValidationFailure &&
        ctrlError?.data &&
        typeof ctrlError.data === "string" &&
        (ctrlError.data.includes("exceed balance") ||
          ctrlError.data.includes("exceeds balance"))))
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
    <>
      {/* <OcclusionDetector /> */}
      <LayoutContainer className={cn(className)}>
        <LayoutHeader
          title={title}
          description={description}
          icon={icon || <PaperPlaneIcon variant="solid" size="lg" />}
          onClose={onClose}
          right={right}
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
                    <Button onClick={() => setCTAState("fund")}>
                      ADD FUNDS
                    </Button>
                  </>
                );
              case ErrorCode.StarknetValidationFailure:
                // Check if it's an insufficient balance error
                if (
                  ctrlError?.data &&
                  typeof ctrlError.data === "string" &&
                  (ctrlError.data.includes("exceed balance") ||
                    ctrlError.data.includes("exceeds balance"))
                ) {
                  return (
                    <>
                      <ControllerErrorAlert error={ctrlError} />
                      <Button onClick={() => setCTAState("fund")}>
                        ADD FUNDS
                      </Button>
                    </>
                  );
                }
                // Fall through to default case for other validation failures
                break;
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
                // Workaround until we can get same fee token address on provable katana
                if (buttonText.toLowerCase() === "upgrade") {
                  return (
                    <Button
                      onClick={handleSubmit}
                      isLoading={isLoading}
                      disabled={
                        !transactions ||
                        !!(maxFee === null && transactions?.length)
                      }
                    >
                      {buttonText}
                    </Button>
                  );
                }

                return (
                  <>
                    {ctrlError && <ControllerErrorAlert error={ctrlError} />}
                    {!ctrlError && (
                      <Fees
                        isLoading={isEstimating}
                        maxFee={maxFee}
                        className="mt-1"
                      />
                    )}
                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={closeModal}
                        type="button"
                        isLoading={isLoading}
                        disabled={
                          !!ctrlError ||
                          !transactions ||
                          !!(maxFee === null && transactions?.length)
                        }
                        variant="secondary"
                        className="w-1/3"
                      >
                        <span className="text-[16px]/[20px] font-semibold text-foreground-100">
                          REJECT
                        </span>
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        disabled={
                          !!ctrlError ||
                          !transactions ||
                          !!(maxFee === null && transactions?.length)
                        }
                        className="w-2/3"
                      >
                        <span className="text-[16px]/[20px] font-semibold text-spacer-100">
                          {buttonText}
                        </span>
                      </Button>
                    </div>
                  </>
                );
            }
          })()}
        </LayoutFooter>
      </LayoutContainer>
    </>
  );
}
