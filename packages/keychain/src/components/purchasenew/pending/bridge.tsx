import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "../receiving";
import { ConfirmingTransaction } from "./confirming-transaction";
import {
  useOnchainPurchaseContext,
  useStarterpackContext,
  Item,
  PaymentMethod,
} from "@/context";
import { Explorer, getExplorer } from "@/hooks/starterpack/layerswap";
import { ExternalWallet, humanizeString } from "@cartridge/controller";
import { useEffect, useState, useRef } from "react";
import { useConnection } from "@/hooks/connection";
import { retryWithBackoff } from "@/utils/retry";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { TransactionFinalityStatus } from "starknet";
import { CoinbaseTransactionStatus } from "@/utils/api";
import { useStarterpackPlayHandler } from "@/hooks/starterpack";

interface TransitionStepProps {
  isVisible: boolean;
  className?: string;
  children: React.ReactNode;
}

function TransitionStep({
  isVisible,
  className = "",
  children,
}: TransitionStepProps) {
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        isVisible ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export interface BridgePendingProps {
  name: string;
  items: Item[];
  paymentMethod?: PaymentMethod;
  transactionHash?: string;
  swapId?: string;
  explorer?: Explorer;
  wallet?: ExternalWallet;
  /** For storybook: override selectedPlatform from context */
  selectedPlatform?: string;
  /** For storybook: override waitForDeposit from context */
  waitForDeposit?: (swapId: string) => Promise<boolean>;
}

/**
 * Pending state for crypto bridging purchases via Layerswap.
 * Currently disabled but preserved for future use.
 */
export function BridgePending({
  name,
  items,
  paymentMethod,
  transactionHash: bridgeTxHash,
  swapId,
  explorer,
  wallet,
  selectedPlatform: selectedPlatformProp,
  waitForDeposit: waitForDepositProp,
}: BridgePendingProps) {
  const onchainContext = useOnchainPurchaseContext();
  const { transactionHash: currentTxHash } = useStarterpackContext();
  const { externalWaitForTransaction, controller, isMainnet } = useConnection();
  const handlePlay = useStarterpackPlayHandler();

  // Use props if provided (for stories), otherwise use context
  const selectedPlatform =
    selectedPlatformProp ?? onchainContext.selectedPlatform;
  const waitForDeposit = waitForDepositProp ?? onchainContext.waitForDeposit;
  const onOnchainPurchase = onchainContext.onOnchainPurchase;
  const getCoinbaseTransactions = onchainContext.getTransactions;

  const [initialBridgeHash, setInitialBridgeHash] = useState(bridgeTxHash);

  // Capture the first valid bridge hash we receive
  useEffect(() => {
    if (!initialBridgeHash && bridgeTxHash) {
      setInitialBridgeHash(bridgeTxHash);
    }
  }, [bridgeTxHash, initialBridgeHash]);

  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [depositCompleted, setDepositCompleted] = useState(false);
  const [showBridging, setShowBridging] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseTxHash, setPurchaseTxHash] = useState<string | undefined>();
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);
  const [showPurchasing, setShowPurchasing] = useState(false);

  const purchaseTriggered = useRef(false);

  // Handle Apple Pay (Coinbase) polling
  useEffect(() => {
    if (
      paymentMethod === "apple-pay" &&
      controller?.username() &&
      !paymentCompleted
    ) {
      const pollCoinbase = async () => {
        try {
          const transactions = await getCoinbaseTransactions(
            controller.username(),
          );
          const completedTx = transactions.find(
            (tx) => tx.status === CoinbaseTransactionStatus.Success,
          );

          if (completedTx) {
            setDepositCompleted(true);
            setPaymentCompleted(true);
          }
        } catch (err) {
          console.error("Failed to poll Coinbase transactions:", err);
        }
      };

      const interval = setInterval(pollCoinbase, 5000);
      return () => clearInterval(interval);
    }
  }, [paymentMethod, controller, getCoinbaseTransactions, paymentCompleted]);

  useEffect(() => {
    if (wallet && initialBridgeHash) {
      retryWithBackoff(() =>
        externalWaitForTransaction(wallet.type, initialBridgeHash),
      )
        .then(() => setDepositCompleted(true))
        .catch((err) => {
          console.error(
            "Failed to wait for external transaction after retries:",
            err,
          );
          setError(err as Error);
        });
    }
  }, [wallet, initialBridgeHash, externalWaitForTransaction]);

  useEffect(() => {
    if (swapId) {
      waitForDeposit(swapId)
        .then(() => setPaymentCompleted(true))
        .catch((err) => {
          console.error("Failed to wait for deposit:", err);
          setError(err as Error);
        });
    }
  }, [swapId, waitForDeposit]);

  useEffect(() => {
    if (depositCompleted) {
      // Add a small delay before showing the bridging status
      setTimeout(() => setShowBridging(true), 300);
    }
  }, [depositCompleted]);

  // Auto-trigger purchase after bridge is completed
  useEffect(() => {
    if (paymentCompleted && !purchaseTriggered.current) {
      purchaseTriggered.current = true;
      setIsPurchasing(true);
      onOnchainPurchase().catch((err) => {
        console.error("Auto-purchase failed:", err);
        setError(err as Error);
        setIsPurchasing(false);
      });
    }
  }, [paymentCompleted, onOnchainPurchase]);

  // Detect purchase transaction hash from context
  useEffect(() => {
    if (isPurchasing) {
      setShowPurchasing(true);
    }
    if (isPurchasing && currentTxHash && currentTxHash !== initialBridgeHash) {
      setPurchaseTxHash(currentTxHash);
    }
  }, [isPurchasing, currentTxHash, initialBridgeHash]);

  // Wait for Starknet purchase transaction
  useEffect(() => {
    if (purchaseTxHash && controller) {
      retryWithBackoff(() =>
        controller.provider.waitForTransaction(purchaseTxHash, {
          retryInterval: 1000,
          successStates: [
            TransactionFinalityStatus.PRE_CONFIRMED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        }),
      )
        .then(() => setPurchaseCompleted(true))
        .catch((err) => {
          console.error("Purchase confirmation failed:", err);
          setError(err as Error);
        });
    }
  }, [purchaseTxHash, controller]);

  return (
    <>
      <HeaderInner title={`Purchasing ${name}`} />
      <LayoutContent>
        <Receiving title="Receiving" items={items} isLoading={false} />
      </LayoutContent>
      <LayoutFooter>
        {error && <ControllerErrorAlert error={error} />}
        {(paymentMethod === "crypto" || paymentMethod === "apple-pay") &&
          !error && (
            <div className="relative space-y-2">
              <div
                className={`transition-transform duration-500 ease-in-out ${
                  depositCompleted ? "-translate-y-1" : "translate-y-0"
                }`}
              >
                <ConfirmingTransaction
                  title={
                    depositCompleted
                      ? paymentMethod === "apple-pay"
                        ? "Confirmed on Coinbase"
                        : `Confirmed on ${humanizeString(selectedPlatform!)}`
                      : paymentMethod === "apple-pay"
                        ? "Confirming on Coinbase"
                        : `Confirming on ${humanizeString(selectedPlatform!)}`
                  }
                  externalLink={explorer?.url}
                  isLoading={!depositCompleted}
                />
              </div>
              <TransitionStep
                isVisible={showBridging || paymentMethod === "apple-pay"}
              >
                <ConfirmingTransaction
                  title={
                    paymentCompleted
                      ? "Bridged to Starknet"
                      : "Bridging to Starknet"
                  }
                  externalLink={
                    initialBridgeHash
                      ? `https://layerswap.io/explorer/${initialBridgeHash}`
                      : undefined
                  }
                  isLoading={!paymentCompleted}
                />
              </TransitionStep>
              <TransitionStep isVisible={showPurchasing}>
                <ConfirmingTransaction
                  title={
                    purchaseCompleted
                      ? "Purchased on Starknet"
                      : "Purchasing on Starknet"
                  }
                  externalLink={
                    purchaseTxHash
                      ? getExplorer("starknet", purchaseTxHash, isMainnet)?.url
                      : undefined
                  }
                  isLoading={!purchaseCompleted}
                />
              </TransitionStep>
            </div>
          )}
        <Button
          className="w-full"
          variant="primary"
          disabled={!purchaseCompleted}
          onClick={handlePlay}
        >
          Play
        </Button>
      </LayoutFooter>
    </>
  );
}
