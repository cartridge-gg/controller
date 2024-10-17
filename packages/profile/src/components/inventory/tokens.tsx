import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SpinnerIcon,
} from "@cartridge/ui-next";
import { ERC20, ERC20Info } from "@cartridge/utils";
import { useEffect, useState } from "react";
import { useConnection } from "@/hooks/context";

export function Tokens() {
  const { address, provider, erc20: erc20Params } = useConnection();
  const [erc20s, setErc20s] = useState<ERC20Info[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setupErc20Info();

    async function setupErc20Info() {
      const res = await Promise.allSettled(
        erc20Params.map((t) =>
          new ERC20({
            address: t.address,
            provider,
            logoUrl: t.logoUrl,
          }).info(),
        ),
      );

      setErc20s(
        res.filter((res) => res.status === "fulfilled").map((res) => res.value),
      );
    }
  }, [erc20Params, provider]);

  useEffect(() => {
    const id = setInterval(updateBalance, 3000);

    async function updateBalance() {
      setIsFetching(true);

      const tokens = await Promise.all(
        erc20s.map(async (t) => {
          try {
            return {
              ...t,
              balance: await t.class.balanceOf(address),
            };
          } catch (e) {
            return { ...t, error: e as Error };
          }
        }),
      );

      setErc20s(tokens);
      setIsFetching(false);
    }

    return () => {
      clearInterval(id);
    };
  }, [address, erc20s, provider]);

  return (
    <Card>
      <CardHeader className="h-10 flex flex-row items-center justify-between">
        <CardTitle>Token</CardTitle>
        {isFetching && <SpinnerIcon className="animate-spin" />}
      </CardHeader>
      {erc20s.map((t, i) => (
        <CardContent
          key={t.address + i}
          className="flex gap-x-1.5 items-center"
        >
          <img src={t.logoUrl} className="w-5 h-5" />
          <div>
            {t.balance === undefined ? "---" : t.balance.toString()} {t.symbol}
          </div>
        </CardContent>
      ))}
    </Card>
  );
}
