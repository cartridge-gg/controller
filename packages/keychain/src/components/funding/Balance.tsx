import { useController } from "@/hooks/controller";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useFeeToken,
} from "@/hooks/tokens";
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
            amount={`${creditBalance.formatted || "Loading"} CREDITS`}
            value={creditBalance.formatted || ""}
          />
        )}
        {types.includes(BalanceType.FEE_TOKEN) && token && (
          <TokenCard
            image={token.icon || ""}
            title={token.name}
            amount={
              token?.balance !== undefined
                ? `${formatBalance(token.balance)} ${token.symbol}`
                : "Loading"
            }
            value={
              token && token.balance !== undefined && token.price
                ? convertTokenAmountToUSD(token.balance, 18, token.price)
                : ""
            }
          />
        )}
      </TokenSummary>
    </Card>
  );
}
