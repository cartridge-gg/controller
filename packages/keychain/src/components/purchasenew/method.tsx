import { useNavigation, useStarterpackContext } from "@/context";
import {
  DepositIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PurchaseCard,
} from "@cartridge/ui";
import { ControllerErrorAlert } from "../ErrorAlert";
import { networkWalletData } from "./wallet/config";
import { useParams } from "react-router-dom";

export function PaymentMethod() {
  const { platforms } = useParams();
  const { navigate } = useNavigation();
  const { displayError } = useStarterpackContext();

  return (
    <>
      <HeaderInner
        title="Choose Payment Method"
        icon={<DepositIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
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
