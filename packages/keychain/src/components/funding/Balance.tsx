import { useController } from "@/hooks/controller";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useFeeToken,
} from "@/hooks/tokens";
import { Card, CardHeader, CardTitle, TokenCard } from "@cartridge/ui-next";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          Balance
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-y-px">
        {types.includes(BalanceType.CREDITS) && (
          <TokenCard
            variant="static"
            image="https://static.cartridge.gg/presets/credit/icon.svg"
            title="Credits"
            amount={`${creditBalance.formatted || "Loading"} CREDITS`}
            value={creditBalance.formatted || ""}
          />
        )}

        {types.includes(BalanceType.FEE_TOKEN) && token && (
          <TokenCard
            variant="static"
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
      </div>
    </Card>
  );
}
