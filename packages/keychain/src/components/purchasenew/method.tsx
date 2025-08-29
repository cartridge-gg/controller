import { useNavigation, usePurchaseContext } from "@/context";
import {
  CreditCardIcon,
  DepositIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PurchaseCard,
} from "@cartridge/ui";
import { useState } from "react";
import { ErrorAlert } from "../ErrorAlert";
import { networkWalletData } from "./wallet/data";
import { useParams } from "react-router-dom";

export function PaymentMethod() {
  const { platforms } = useParams();
  const { navigate } = useNavigation();
  const { onCreditCard, displayError } = usePurchaseContext();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <HeaderInner
        title="Choose Payment Method"
        icon={<DepositIcon variant="solid" size="lg" />}
      />
      <LayoutContent className={isLoading ? "pointer-events-none" : ""}>
        <PurchaseCard
          text="Credit Card"
          icon={<CreditCardIcon variant="solid" />}
          onClick={async () => {
            setIsLoading(true);
            await onCreditCard();
            navigate("/purchase/checkout/stripe");
          }}
        />

        {networkWalletData.networks.map((network) => {
          if (platforms && !platforms.includes(network.platform)) {
            return null;
          }

          return (
            <PurchaseCard
              key={network.platform}
              text={network.name}
              icon={network.icon}
              onClick={() => navigate(`/purchase/wallet/${network.platform}`)}
            />
          );
        })}
      </LayoutContent>
      <LayoutFooter>
        {displayError && (
          <ErrorAlert
            variant="error"
            title="Purchase Error"
            description={displayError.message}
          />
        )}
      </LayoutFooter>
    </>
  );
}
