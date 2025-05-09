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
} from "@cartridge/ui";
import { useCreditBalance } from "@cartridge/ui/utils";

export enum BalanceType {
  CREDITS = "credits",
  FEE_TOKEN = "fee-token",
}

type BalanceProps = {
  title?: string;
  types: BalanceType[];
  amount?: number;
};

export function Balance({ types, title, amount }: BalanceProps) {
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
          {title ?? "Balance"}
        </CardTitle>
      </CardHeader>
      <TokenSummary className="rounded-tl-none rounded-tr-none">
        {types.includes(BalanceType.CREDITS) && (
          <TokenCard
            image={"https://static.cartridge.gg/presets/credit/icon.svg"}
            title={"Credits"}
            amount={
              amount
                ? `${amount.toFixed(2).toString()}`
                : `${creditBalance.formatted} CREDITS`
            }
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
