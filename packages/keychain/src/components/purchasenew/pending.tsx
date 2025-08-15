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
import {
  PaymentMethod,
  PurchaseItem,
  usePurchaseContext,
} from "@/context/purchase";
import { Explorer } from "@/hooks/payments/crypto";
import { ExternalWallet, humanizeString } from "@cartridge/controller";
import { useEffect, useState } from "react";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";

export function PurchasePending() {
  const {
    purchaseItems,
    explorer,
    paymentMethod,
    selectedWallet,
    paymentId,
    transactionHash,
  } = usePurchaseContext();
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
  items: PurchaseItem[];
  paymentMethod?: PaymentMethod;
  transactionHash?: string;
  paymentId?: string;
  explorer?: Explorer;
  wallet?: ExternalWallet;
}) {
  const { navigate } = useNavigation();
  const { waitForPayment } = usePurchaseContext();
  const { externalWaitForTransaction } = useConnection();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [depositCompleted, setDepositCompleted] = useState(false);

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
          <>
            <ConfirmingTransaction
              title={`Confirming on ${humanizeString(wallet?.platform || "")}`}
              externalLink={explorer?.url}
              isLoading={!depositCompleted}
            />
            <ConfirmingTransaction
              title="Bridging to Starknet on Layerswap"
              // Layerswap does not support testnet, only works mainnet
              externalLink={`https://layerswap.io/explorer/${transactionHash}`}
              isLoading={!paymentCompleted}
            />
          </>
        )}
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
    <Card className="bg-background-100 border border-background-200 p-2">
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
