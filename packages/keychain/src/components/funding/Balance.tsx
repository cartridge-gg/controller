import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
  CoinsIcon,
} from "@cartridge/ui-next";
import { useCreditBalance } from "@cartridge/utils";
import { useController } from "@/hooks/controller";
import { formatBalance, formatUSDBalance, useFeeToken } from "@/hooks/tokens";

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
        <CardTitle>Balance</CardTitle>
      </CardHeader>

      <CardListContent>
        {types.includes(BalanceType.CREDITS) && (
          <CardListItem icon={<CoinsIcon variant="solid" />}>
            <div className="flex items-center gap-2">
              {creditBalance.formatted ? 0 : "Loading"}
              <span className="text-muted-foreground">CREDITS</span>
            </div>
          </CardListItem>
        )}

        {types.includes(BalanceType.FEE_TOKEN) && token && (
          <CardListItem icon={token.icon}>
            <div className="flex items-center gap-2">
              {token?.balance !== undefined
                ? formatBalance(token.balance)
                : "Loading"}
              <span className="text-muted-foreground">{token.symbol}</span>
            </div>

            {token && token.balance !== undefined && token.price ? (
              <div className="text-muted-foreground">
                {formatUSDBalance(token.balance, 18, token.price)}
              </div>
            ) : null}
          </CardListItem>
        )}
      </CardListContent>
    </Card>
  );
}
