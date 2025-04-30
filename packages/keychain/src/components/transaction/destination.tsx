import {
  ActivityCard,
  ArgentIcon,
  BraavosIcon,
  Card,
  CardHeader,
  CardTitle,
  cn,
  ControllerAccountIcon,
  OpenZeppelinIcon,
  Thumbnail,
  WalletIcon,
  WalletType,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import { useCallback } from "react";

interface Props {
  wallet: WalletType;
  address: string;
  name?: string;
}

export function TransactionDestination({ wallet, address, name }: Props) {
  const getIcon = useCallback((wallet: WalletType | null) => {
    switch (wallet) {
      case WalletType.Controller:
        return <ControllerAccountIcon className="h-8 w-8" />;
      case WalletType.ArgentX:
        return <ArgentIcon className="h-8 w-8" />;
      case WalletType.Braavos:
        return <BraavosIcon className="h-8 w-8" />;
      case WalletType.OpenZeppelin:
        return <OpenZeppelinIcon className="h-8 w-8" />;
      default:
        return <WalletIcon variant="solid" className="h-8 w-8" />;
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          Destination
        </CardTitle>
      </CardHeader>
      <ActivityCard
        Logo={
          <Thumbnail icon={getIcon(wallet)} size="lg" variant="light" rounded />
        }
        title={name || address}
        subTitle={formatAddress(address, { first: 4, last: 4 })}
        variant={"default"}
        className={cn(
          "rounded-none gap-3 hover:bg-background-200 hover:cursor-default",
        )}
      />
    </Card>
  );
}
