import { useController } from "@/hooks/controller";
import { convertTokenAmountToUSD, useFeeToken } from "@/hooks/tokens";
import {
  Card,
  CardHeader,
  CardTitle,
  TokenCard,
  TokenSummary,
} from "@cartridge/ui-next";
import { useCreditBalance } from "@cartridge/utils";

export enum BalanceType {
  CREDITS = "credits",
  FEE_TOKEN = "fee-token",
}

type BalanceProps = {
  types: BalanceType[];
};

export function Balance({ types }: BalanceProps) {
  const { controller } = useController();
  const { balance: creditBalance } = useCreditBalance({
    username: controller?.username(),
    interval: 3000,
  });

  const { token } = useFeeToken();

  if (!token) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          Balance
        </CardTitle>
      </CardHeader>
      <TokenSummary>
        {types.includes(BalanceType.CREDITS) && (
          <TokenCard
            image={"https://static.cartridge.gg/presets/credit/icon.svg"}
            title={"Credits"}
            amount={creditBalance.value.toString() + " CREDITS"}
            value={creditBalance.formatted}
          />
        )}
        {types.includes(BalanceType.FEE_TOKEN) && token && (
          <TokenCard
            image={token.icon!}
            title={token.symbol}
            amount={token.balance!.toString() + " " + token.symbol}
            value={
              token.balance && token.price
                ? convertTokenAmountToUSD(token.balance, 18, token.price)
                : "$0"
            }
          />
        )}
      </TokenSummary>
    </Card>
  );
}
