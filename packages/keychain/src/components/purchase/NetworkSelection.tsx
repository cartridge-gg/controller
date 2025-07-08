import {
  Button,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StarknetIcon,
  EthereumIcon,
  SolanaIcon,
  CoinsIcon,
} from "@cartridge/ui";
import { Network } from "./types";

export type NetworkSelectionProps = {
  onBack: () => void;
  onNetworkSelected: (network: Network) => void;
};

const NETWORKS: Network[] = [
  {
    id: "starknet",
    name: "Starknet",
    icon: StarknetIcon,
    color: "#FF875B",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: EthereumIcon,
    color: "#627EEA",
  },
  {
    id: "solana",
    name: "Solana",
    icon: SolanaIcon,
    color: "#AB9FF2",
  },
  {
    id: "base",
    name: "Base",
    icon: CoinsIcon,
    color: "#0052FF",
  },
];

export function NetworkSelection({
  onBack,
  onNetworkSelected,
}: NetworkSelectionProps) {
  return (
    <LayoutContainer>
      <LayoutHeader title="Choose Network" onBack={onBack} />
      <LayoutContent className="gap-4">
        {NETWORKS.map((network) => {
          const IconComponent = network.icon;
          return (
            <Button
              key={network.id}
              className="flex justify-start items-center gap-3 h-12 bg-background-200 hover:bg-background-300 text-foreground-100"
              variant="secondary"
              onClick={() => onNetworkSelected(network)}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: network.color }}
              >
                <IconComponent size="xs" className="text-white" />
              </div>
              {network.name}
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
