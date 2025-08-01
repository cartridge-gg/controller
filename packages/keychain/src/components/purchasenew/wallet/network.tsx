import {
  Button,
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PaymentCard,
} from "@cartridge/ui";
import { networkWalletData } from "./data";
import { useNavigation } from "@/context";

export function ChooseNetwork() {
  const { goBack, navigate } = useNavigation();
  return (
    <>
      <HeaderInner
        title="Choose Network"
        icon={<GlobeIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {networkWalletData.networks.map((network) => (
          <PaymentCard
            key={network.platform}
            text={network.name + (network.enabled ? "" : " (Coming Soon)")}
            icon={network.icon}
            onClick={() => navigate(`/purchase/wallet/${network.platform}`)}
            className={!network.enabled ? "opacity-50 pointer-events-none" : ""}
          />
        ))}
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={goBack}>
          Back
        </Button>
      </LayoutFooter>
    </>
  );
}
