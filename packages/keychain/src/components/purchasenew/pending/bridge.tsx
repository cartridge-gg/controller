import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "../receiving";
import { ConfirmingTransaction } from "./confirming-transaction";
import { useOnchainPurchaseContext, Item, PaymentMethod } from "@/context";
import { Explorer } from "@/hooks/starterpack/layerswap";
import { ExternalWallet, humanizeString } from "@cartridge/controller";
import { useEffect, useState } from "react";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";
import { retryWithBackoff } from "@/utils/retry";
import { ControllerErrorAlert } from "@/components/ErrorAlert";

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
  transactionHash,
  swapId,
  explorer,
  wallet,
  selectedPlatform: selectedPlatformProp,
  waitForDeposit: waitForDepositProp,
}: BridgePendingProps) {
  const { navigate } = useNavigation();
  const onchainContext = useOnchainPurchaseContext();
  const { externalWaitForTransaction } = useConnection();

  // Use props if provided (for stories), otherwise use context
  const selectedPlatform =
    selectedPlatformProp ?? onchainContext.selectedPlatform;
  const waitForDeposit = waitForDepositProp ?? onchainContext.waitForDeposit;
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [depositCompleted, setDepositCompleted] = useState(false);
  const [showBridging, setShowBridging] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (wallet && transactionHash) {
      retryWithBackoff(() =>
        externalWaitForTransaction(wallet.type, transactionHash),
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
  }, [wallet, transactionHash, externalWaitForTransaction, navigate]);

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

  useEffect(() => {
    if (paymentCompleted && depositCompleted) {
      setTimeout(() => navigate("/purchase/success", { reset: true }), 1000);
    }
  }, [paymentCompleted, depositCompleted, navigate]);

  return (
    <>
      <HeaderInner title={`Purchasing ${name}`} />
      <LayoutContent>
        <Receiving title="Receiving" items={items} isLoading={false} />
      </LayoutContent>
      <LayoutFooter>
        {error && <ControllerErrorAlert error={error} />}
        {paymentMethod === "crypto" && !error && (
          <div className="relative space-y-2">
            <div
              className={`transition-transform duration-500 ease-in-out ${
                depositCompleted ? "-translate-y-1" : "translate-y-0"
              }`}
            >
              <ConfirmingTransaction
                title={`Confirming on ${humanizeString(selectedPlatform!)}`}
                externalLink={explorer?.url}
                isLoading={!depositCompleted}
              />
            </div>
            <div
              className={`transition-all duration-500 ease-in-out ${
                showBridging
                  ? "opacity-100 max-h-20"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <ConfirmingTransaction
                title="Bridging to Starknet"
                externalLink={`https://layerswap.io/explorer/${transactionHash}`}
                isLoading={!paymentCompleted}
              />
            </div>
          </div>
        )}
        <Button className="w-full" variant="primary" disabled={true}>
          Play
        </Button>
      </LayoutFooter>
    </>
  );
}
