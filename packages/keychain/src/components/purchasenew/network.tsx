import {
  Button,
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PaymentCard,
} from "@cartridge/ui";
import { NetworkWalletData } from "./types";

interface ChooseNetworkProps {
  data: NetworkWalletData;
  onNetworkSelect?: (networkId: string) => void;
  onCancel?: () => void;
}

export function ChooseNetwork({
  data,
  onNetworkSelect = () => {},
  onCancel = () => {},
}: ChooseNetworkProps) {
  return (
    <>
      <HeaderInner
        title="Choose Network"
        icon={<GlobeIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {data.networks.map((network) => (
          <PaymentCard
            key={network.id}
            text={network.name}
            icon={network.icon}
            onClick={() => onNetworkSelect(network.id)}
          />
        ))}
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </LayoutFooter>
    </>
  );
}
