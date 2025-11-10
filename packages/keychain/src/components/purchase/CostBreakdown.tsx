import {
  ArgentIcon,
  ArgentColorIcon,
  StarknetIcon,
  MetaMaskIcon,
  MetaMaskColorIcon,
  EthereumIcon,
  PhantomIcon,
  PhantomColorIcon,
  SolanaIcon,
  Card,
  CardContent,
  CreditIcon,
  InfoIcon,
  Separator,
  Thumbnail,
} from "@cartridge/ui";
import { PricingDetails } from ".";
import { ExternalWalletType } from "@cartridge/controller";
import { FeesTooltip } from "./FeesTooltip";

type PaymentRails = "stripe" | "crypto";
type PaymentUnit = "usdc" | "credits";

export const WALLET_CONFIG = {
  argent: {
    icon: ArgentIcon,
    colorIcon: ArgentColorIcon,
    network: "Starknet",
    networkIcon: StarknetIcon,
    bgColor: "#FF875B",
  },
  metamask: {
    icon: MetaMaskIcon,
    colorIcon: MetaMaskColorIcon,
    network: "Ethereum",
    networkIcon: EthereumIcon,
    bgColor: "#E88A39",
  },
  phantom: {
    icon: PhantomIcon,
    colorIcon: PhantomColorIcon,
    network: "Solana",
    networkIcon: SolanaIcon,
    bgColor: "#AB9FF2",
  },
} as const;

export function CostBreakdown({
  rails,
  price,
  walletType,
  paymentUnit,
  openFeesTooltip = false,
}: {
  rails: PaymentRails;
  price: PricingDetails;
  walletType?: ExternalWalletType;
  paymentUnit?: PaymentUnit;
  openFeesTooltip?: boolean;
}) {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (rails === "crypto" && !walletType) {
    return;
  }

  return (
    <Card className="gap-3">
      <CardContent className="flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
        {rails === "crypto" && (
          <>
            <div className="text-foreground-400 font-normal text-xs flex flex-row items-center gap-1">
              Purchase funds on <Network walletType={walletType} />
            </div>
            <Separator className="bg-background-200" />
          </>
        )}

        <div className="flex justify-between text-xs font-medium">
          Cost
          <div>{formatCurrency(price.baseCostInCents)}</div>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <div className="flex gap-2  text-xs font-medium">
            Fees
            <FeesTooltip
              trigger={<InfoIcon size="xs" />}
              isStripe={rails === "stripe"}
              defaultOpen={openFeesTooltip}
            />
          </div>
          <div>{formatCurrency(price.processingFeeInCents)}</div>
        </div>
      </CardContent>
      <div className="flex flex-row gap-3 h-[40px]">
        <CardContent className="flex items-center border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400 w-full">
          <div className="flex justify-between text-sm font-medium w-full">
            Total
            <div className="text-foreground-100">
              {formatCurrency(price.totalInCents)}
            </div>
          </div>
        </CardContent>
        <PaymentType unit={paymentUnit} />
      </div>
    </Card>
  );
}

const Network = ({ walletType }: { walletType?: ExternalWalletType }) => {
  if (walletType) {
    const NetworkIcon =
      WALLET_CONFIG[walletType as keyof typeof WALLET_CONFIG].networkIcon;

    return (
      <>
        <NetworkIcon size="xs" className="inline-block" />
        {WALLET_CONFIG[walletType as keyof typeof WALLET_CONFIG].network}
      </>
    );
  }

  return null;
};

const PaymentType = ({ unit }: { unit?: PaymentUnit }) => {
  if (!unit) {
    return <></>;
  }

  return (
    <CardContent className="flex items-center px-3 bg-background-200 gap-2 rounded-[4px] text-sm font-medium">
      <Thumbnail
        size="sm"
        icon={
          unit === "usdc" ? (
            "https://static.cartridge.gg/tokens/usdc.svg"
          ) : (
            <CreditIcon />
          )
        }
        variant="light"
        rounded
      />
      {unit.toUpperCase()}
    </CardContent>
  );
};
