import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyAddress,
  SpinnerIcon,
} from "@cartridge/ui-next";
import { ERC20, ERC20Info } from "@cartridge/utils";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";
// import { Navigation } from "./navigation";
import { useEffect, useState } from "react";

export function Inventory() {
  const { username, address, provider, erc20: erc20Params } = useConnection();
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
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        // right={<Navigation />}
      />

      <LayoutContent className="pb-4">
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
                {t.balance === undefined ? "---" : t.balance.toString()}{" "}
                {t.symbol}
              </div>
            </CardContent>
          ))}
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Golden Token (2)</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-3 gap-2 place-items-center">
            {Array.from({ length: 28 }).map((_, i) => (
              <div className="w-32 h-32" key={i}>
                <img
                  src={
                    "https://github.com/BibliothecaDAO/loot-survivor/blob/main/ui/public/golden-token.png?raw=true"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card> */}
      </LayoutContent>
    </LayoutContainer>
  );
}
