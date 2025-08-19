import {
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  PurchaseCard,
} from "@cartridge/ui";
import { networkWalletData } from "./data";
import { useNavigation } from "@/context";
import { useParams } from "react-router-dom";

export function ChooseNetwork() {
  const { filter } = useParams();
  const { navigate } = useNavigation();
  return (
    <>
      <HeaderInner
        title="Choose Network"
        icon={<GlobeIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {networkWalletData.networks.map((network) => {
          if (filter && network.platform !== filter) {
            return null;
          }

          return (
            <PurchaseCard
              key={network.platform}
              text={network.name + (network.enabled ? "" : " (Coming Soon)")}
              icon={network.icon}
              onClick={() => navigate(`/purchase/wallet/${network.platform}`)}
              className={
                !network.enabled ? "opacity-50 pointer-events-none" : ""
              }
            />
          );
        })}
      </LayoutContent>
    </>
  );
}
