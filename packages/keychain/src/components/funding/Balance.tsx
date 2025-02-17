import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@cartridge/ui-next";
import { useCreditBalance, useFeeToken, } from "@cartridge/utils";
import { useController } from "@/hooks/controller";
import { formatBalance, convertTokenAmountToUSD } from "@/hooks/tokens";

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

      <CardListContent>
        {types.includes(BalanceType.CREDITS) && (
          <CardListItem className="flex flex-row items-center p-4">
            <div className="flex flex-row items-center gap-3">
              <div className="p-1 bg-background-300 rounded-full">
                <img src="/ERC-20-Icon.svg" className="size-8" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-foreground-100 font-medium text-sm">
                  Credits
                </p>
                <p className="text-foreground-300 font-normal text-xs">
                  {creditBalance.formatted
                    ? creditBalance.formatted
                    : "Loading"}{" "}
                  CREDITS
                </p>
              </div>
            </div>
            <p className="text-foreground-100 font-medium text-sm">{`${creditBalance.formatted}`}</p>
          </CardListItem>
        )}

        {types.includes(BalanceType.FEE_TOKEN) && token && (
          <CardListItem icon={token.icon}>
            <div className="flex items-center gap-2">
              {token?.balance !== undefined
                ? formatBalance(token.balance)
                : "Loading"}
              <span className="text-foreground-400">{token.symbol}</span>
            </div>

            {token && token.balance !== undefined && token.price ? (
              <div className="text-foreground-400">
                {convertTokenAmountToUSD(token.balance, 18, token.price)}
              </div>
            ) : null}
          </CardListItem>
        )}
      </CardListContent>
    </Card>
  );
}
