import {
  useNavigation,
  useStarterpackContext,
  useCreditPurchaseContext,
} from "@/context";
import {
  CreditCardIcon,
  DepositIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PurchaseCard,
} from "@cartridge/ui";
import { useState } from "react";
import { ControllerErrorAlert } from "../ErrorAlert";
import { networkWalletData } from "./wallet/config";
import { useParams } from "react-router-dom";

export function PaymentMethod() {
  const { platforms } = useParams();
  const { navigate } = useNavigation();
  const { displayError } = useStarterpackContext();
  const { onCreditCardPurchase } = useCreditPurchaseContext();
  const [isLoading, setIsLoading] = useState(false);
  const showCreditCard = false;

  return (
    <>
      <HeaderInner
        title="Choose Payment Method"
        icon={<DepositIcon variant="solid" size="lg" />}
      />
      <LayoutContent className={isLoading ? "pointer-events-none" : ""}>
        {showCreditCard && (
          <PurchaseCard
            text="Credit Card"
            icon={<CreditCardIcon variant="solid" />}
            onClick={async () => {
              setIsLoading(true);
              await onCreditCardPurchase();
              navigate("/purchase/checkout/stripe");
            }}
          />
        )}

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
        {displayError && <ControllerErrorAlert error={displayError} />}
      </LayoutFooter>
    </>
  );
}
