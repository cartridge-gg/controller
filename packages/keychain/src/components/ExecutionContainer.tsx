import { ControllerErrorAlert, ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import type { ControllerError } from "@/utils/connection";
import { parseControllerError } from "@/utils/connection/execute";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import {
  Button,
  HeaderInner,
  type HeaderProps,
  LayoutFooter,
} from "@cartridge/ui";
import { isEqual } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Call, FeeEstimate } from "starknet";
import { DeployController } from "./DeployController";
import { Fees } from "./Fees";
import { useNavigation } from "@/context/navigation";

interface ExecutionContainerProps {
  transactions: Call[];
  executionError?: ControllerError;
  onSubmit: (maxFee?: FeeEstimate) => Promise<void>;
  onDeploy?: () => void;
  onError?: (error: ControllerError) => void;
  buttonText?: string;
  children: React.ReactNode;
  right?: React.ReactElement;
}

export function ExecutionContainer({
  title,
  description,
  icon,
  transactions,
  executionError,
  onSubmit,
  onDeploy,
  onError,
  buttonText = "SUBMIT",
  right,
  children,
}: ExecutionContainerProps &
  Pick<HeaderProps, "title" | "description" | "icon">) {
  const { controller } = useConnection();
  const [maxFee, setMaxFee] = useState<FeeEstimate | undefined>();
  const [ctrlError, setCtrlError] = useState<ControllerError | undefined>(
    executionError,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(true);
  const [ctaState, setCTAState] = useState<"deploy" | "execute">("execute");

  // Prevent unnecessary estimate fee calls.
  const prevTransactionsRef = useRef<{
    transactions: Call[] | undefined;
    feeEstimate: FeeEstimate | undefined;
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
        // Only clear error if it was from fee estimation, not from props
        if (!executionError) {
          setCtrlError(undefined);
        }

        setMaxFee(maxFee);
        setIsEstimating(false);
      } catch (e) {
        const error = parseControllerError(e as unknown as ControllerError);
        onError?.(error);
        setCtrlError(error);
        setIsEstimating(false);
      }
    },
    [controller, onError, setCtrlError, executionError],
  );

  useEffect(() => {
    if (!transactions?.length) {
      return;
    }

    // Only estimate if transactions have changed
    if (isEqual(prevTransactionsRef.current.transactions, transactions)) {
      return;
    }

    // Update ref with current values
    prevTransactionsRef.current = { transactions, feeEstimate: maxFee };

    const estimateFeesAsync = async () => {
      await estimateFees(transactions);
    };

    estimateFeesAsync();
  }, [transactions, estimateFees, maxFee]);

  useEffect(() => {
    setCtrlError(executionError);
  }, [executionError]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(maxFee);
    } catch (e) {
      console.error(e);
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
      <HeaderInner
        title={title}
        description={description}
        icon={icon}
        right={right}
        hideIcon
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
                  <FundingButton />
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
                    <FundingButton />
                  </>
                );
              }
              // Other validation failures (e.g., gas price issues) - show retry button
              return (
                <>
                  <ControllerErrorAlert error={ctrlError} />
                  <Button disabled>{buttonText}</Button>
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
                    <Fees isLoading={isEstimating} maxFee={maxFee} />
                  )}
                  <Button
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    disabled={
                      isEstimating ||
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
    </>
  );
}

const FundingButton = () => {
  const { navigate } = useNavigation();
  return (
    <Button
      onClick={() => {
        navigate(
          `/purchase/credits?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
      }}
    >
      ADD FUNDS
    </Button>
  );
};
