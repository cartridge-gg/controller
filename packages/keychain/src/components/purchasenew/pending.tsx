import {
  Card,
  CardDescription,
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
import { Explorer, useCryptoPayment } from "@/hooks/payments/crypto";
import { ExternalPlatform, humanizeString } from "@cartridge/controller";
import { useEffect } from "react";
import { useNavigation } from "@/context";

export function PurchasePending() {
  const { purchaseItems, explorer, paymentMethod, selectedWallet, paymentId } =
    usePurchaseContext();
  return (
    <PurchasePendingInner
      items={purchaseItems}
      paymentId={paymentId}
      paymentMethod={paymentMethod}
      explorer={explorer}
      platform={selectedWallet?.platform}
    />
  );
}

export function PurchasePendingInner({
  items,
  paymentMethod,
  paymentId,
  explorer,
  platform,
}: {
  items: PurchaseItem[];
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  explorer?: Explorer;
  platform?: ExternalPlatform;
}) {
  const { navigate } = useNavigation();
  const { waitForPayment } = useCryptoPayment();

  useEffect(() => {
    if (paymentId) {
      waitForPayment(paymentId).then(() => {
        navigate("/purchase/success", { reset: true });
      });
    }
  }, [paymentId, waitForPayment]);

  return (
    <>
      <HeaderInner title="Pending Confirmation" icon={<Spinner />} />
      <LayoutContent>
        <Receiving title="Receiving" items={items} isLoading={true} />
      </LayoutContent>
      <LayoutFooter>
        {paymentMethod === "crypto" && (
          <ConfirmingTransaction platform={platform} explorer={explorer} />
        )}
      </LayoutFooter>
    </>
  );
}

export function ConfirmingTransaction({
  platform,
  explorer,
}: {
  platform?: ExternalPlatform;
  explorer?: Explorer;
}) {
  if (!platform || !explorer) {
    return <></>;
  }

  return (
    <Card className="bg-background-100 border border-background-200 p-3">
      <CardDescription className="flex flex-row items-start gap-3 items-center">
        <div className="flex justify-between w-full">
          <div className="text-foreground-200 font-normal text-xs flex items-center gap-1">
            <Spinner size="sm" />
            Confirming on {humanizeString(platform)}
          </div>
          <a href={explorer?.url} target="_blank" className="flex items-center">
            <ExternalIcon size="sm" className="inline-block" />
          </a>
        </div>
      </CardDescription>
    </Card>
  );
}
