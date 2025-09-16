import {
  Card,
  CardDescription,
  CheckIcon,
  ExternalIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Spinner,
} from "@cartridge/ui";
import { Receiving } from "./receiving";
import { PaymentMethod, Item, usePurchaseContext } from "@/context/purchase";
import { Explorer, getExplorer } from "@/hooks/payments/crypto";
import { ExternalWallet, humanizeString } from "@cartridge/controller";
import { useEffect, useState } from "react";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";
import { TransactionFinalityStatus } from "starknet";

export function Pending() {
  const {
    starterpackDetails,
    purchaseItems,
    claimItems,
    explorer,
    paymentMethod,
    selectedWallet,
    paymentId,
    transactionHash,
  } = usePurchaseContext();

  if (
    starterpackDetails?.acquisitionType === StarterpackAcquisitionType.Claimed
  ) {
    return (
      <ClaimPendingInner
        items={claimItems}
        transactionHash={transactionHash!}
      />
    );
  }

  return (
    <PurchasePendingInner
      items={purchaseItems}
      paymentId={paymentId}
      transactionHash={transactionHash}
      paymentMethod={paymentMethod}
      explorer={explorer}
      wallet={selectedWallet}
    />
  );
}

export function PurchasePendingInner({
  items,
  paymentMethod,
  paymentId,
  transactionHash,
  explorer,
  wallet,
}: {
  items: Item[];
  paymentMethod?: PaymentMethod;
  transactionHash?: string;
  paymentId?: string;
  explorer?: Explorer;
  wallet?: ExternalWallet;
}) {
  const { navigate } = useNavigation();
  const { waitForPayment, selectedPlatform } = usePurchaseContext();
  const { externalWaitForTransaction } = useConnection();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [depositCompleted, setDepositCompleted] = useState(false);
  const [showBridging, setShowBridging] = useState(false);

  useEffect(() => {
    if (wallet && transactionHash) {
      externalWaitForTransaction(wallet.type, transactionHash).then(() =>
        setDepositCompleted(true),
      );
    }
  }, [wallet, transactionHash, externalWaitForTransaction, navigate]);

  useEffect(() => {
    if (paymentId) {
      waitForPayment(paymentId).then(() => setPaymentCompleted(true));
    }
  }, [paymentId, waitForPayment, navigate]);

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
      <HeaderInner title="Pending Confirmation" icon={<Spinner />} />
      <LayoutContent>
        <Receiving title="Receiving" items={items} isLoading={true} />
      </LayoutContent>
      <LayoutFooter>
        {paymentMethod === "crypto" && (
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
      </LayoutFooter>
    </>
  );
}

export function ClaimPendingInner({
  items,
  transactionHash,
}: {
  items: Item[];
  transactionHash: string;
}) {
  const { isMainnet, controller } = useConnection();
  const { navigate } = useNavigation();
  const [isClaiming, setIsClaiming] = useState(true);

  useEffect(() => {
    controller?.provider
      .waitForTransaction(transactionHash, {
        retryInterval: 1000,
        successStates: [
          TransactionFinalityStatus.PRE_CONFIRMED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      })
      .then(() => {
        setIsClaiming(false);
        navigate("/purchase/success", { reset: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }, [controller, transactionHash, navigate]);

  return (
    <>
      <HeaderInner title="Pending Confirmation" icon={<Spinner />} />
      <LayoutContent>
        <Receiving title="Receiving" items={items} isLoading={true} />
      </LayoutContent>
      <LayoutFooter>
        <ConfirmingTransaction
          title="Claiming"
          externalLink={getExplorer("starknet", transactionHash, isMainnet).url}
          isLoading={isClaiming}
        />
      </LayoutFooter>
    </>
  );
}

export function ConfirmingTransaction({
  title,
  externalLink,
  isLoading,
}: {
  title: string;
  externalLink?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="bg-background-100 border border-background-200 p-2 transition-all duration-300">
      <CardDescription className="flex flex-row items-start gap-3 items-center">
        <div className="flex justify-between w-full">
          <div className="text-foreground-200 font-normal text-xs flex items-center gap-1">
            {isLoading ? <Spinner size="sm" /> : <CheckIcon size="sm" />}
            {title}
          </div>
          {externalLink && (
            <a
              href={externalLink}
              target="_blank"
              className="flex items-center"
            >
              <ExternalIcon size="sm" className="inline-block" />
            </a>
          )}
        </div>
      </CardDescription>
    </Card>
  );
}
