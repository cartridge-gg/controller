import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PaymentCard,
  WalletIcon,
} from "@cartridge/ui";
import { NetworkWalletData } from "./types";

interface SelectWalletProps {
  data: NetworkWalletData;
  selectedNetworkId: string;
  onWalletSelect?: (walletId: string) => void;
  onBack?: () => void;
}

export function SelectWallet({
  data,
  selectedNetworkId,
  onWalletSelect = () => {},
  onBack = () => {},
}: SelectWalletProps) {
  const selectedNetwork = data.networks.find((n) => n.id === selectedNetworkId);

  if (!selectedNetwork) {
    return (
      <>
        <HeaderInner
          title="Select a Wallet"
          icon={<WalletIcon variant="solid" size="lg" />}
        />
        <LayoutContent>
          <div>Network not found</div>
        </LayoutContent>
      </>
    );
  }

  return (
    <>
      <HeaderInner
        title={`Select a ${selectedNetwork.name} Wallet`}
        icon={<WalletIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {selectedNetwork.wallets.map((wallet) => (
          <PaymentCard
            key={wallet.id}
            text={wallet.name}
            icon={wallet.icon}
            onClick={() => onWalletSelect(wallet.id)}
          />
        ))}
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancel
        </Button>
      </LayoutFooter>
    </>
  );
}
