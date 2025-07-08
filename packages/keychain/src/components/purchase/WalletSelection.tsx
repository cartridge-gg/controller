import {
  Button,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  PhantomIcon,
  MetaMaskIcon,
  WalletIcon,
} from "@cartridge/ui";
import { Network } from "./types";

export type WalletSelectionProps = {
  selectedNetwork: Network;
  onBack: () => void;
  onWalletSelected: (walletType: string) => void;
};

type WalletOption = {
  id: string;
  name: string;
  icon: React.ElementType;
  networks: string[];
};

const WALLETS: WalletOption[] = [
  {
    id: "phantom",
    name: "Phantom",
    icon: PhantomIcon,
    networks: ["solana"],
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: WalletIcon,
    networks: ["solana"],
  },
  {
    id: "ready",
    name: "Ready",
    icon: WalletIcon,
    networks: ["starknet"],
  },
  {
    id: "braavos",
    name: "Braavos",
    icon: WalletIcon,
    networks: ["starknet"],
  },
  {
    id: "rabby",
    name: "Rabby",
    icon: WalletIcon,
    networks: ["ethereum"],
  },
  {
    id: "metamask",
    name: "Metamask",
    icon: MetaMaskIcon,
    networks: ["ethereum"],
  },
];

export function WalletSelection({
  selectedNetwork,
  onBack,
  onWalletSelected,
}: WalletSelectionProps) {
  const availableWallets = WALLETS.filter((wallet) =>
    wallet.networks.includes(selectedNetwork.id),
  );

  return (
    <LayoutContainer>
      <LayoutHeader title="Select a Wallet" onBack={onBack} />
      <LayoutContent className="gap-4">
        {availableWallets.map((wallet) => {
          const IconComponent = wallet.icon;
          return (
            <Button
              key={wallet.id}
              className="flex justify-between items-center h-12 bg-background-200 hover:bg-background-300 text-foreground-100"
              variant="secondary"
              onClick={() => onWalletSelected(wallet.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <IconComponent size="sm" />
                </div>
                {wallet.name}
              </div>
              <div className="text-foreground-300 text-sm">
                {selectedNetwork.name}
              </div>
            </Button>
          );
        })}
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancel
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
