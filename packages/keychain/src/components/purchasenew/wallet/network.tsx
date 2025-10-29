import {
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  PurchaseCard,
} from "@cartridge/ui";
import { networkWalletData } from "./config";
import { useNavigation } from "@/context";
import { useParams } from "react-router-dom";

export function ChooseNetwork() {
  const { platforms } = useParams();
  const { navigate } = useNavigation();
  return (
    <>
      <HeaderInner
        title="Choose Network"
        icon={<GlobeIcon variant="solid" size="lg" />}
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
    </>
  );
}
