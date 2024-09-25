import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyAddress,
  SpinnerIcon,
} from "@cartridge/ui-next";
import { erc20 } from "@cartridge/utils";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";
import { Navigation } from "./navigation";
import { useEffect, useState } from "react";

export function Inventory() {
  const { username, address, provider } = useConnection();
  const [erc20s, setErc20s] = useState(ERC_20_TOKENS);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const id = setInterval(async () => {
      setIsFetching(true);

      const tokens = await Promise.all(
        erc20s.map(async (t) => {
          try {
            const balance = await erc20.balanceOf({
              accountAddress: address,
              tokenAddress: t.address,
              provider,
            });

            return {
              ...t,
              balance,
            };
          } catch (error) {
            return { ...t, error };
          }
        }),
      );

      setErc20s(tokens);
      setIsFetching(false);
    }, 3000);

    return () => {
      clearInterval(id);
    };
  }, [address, erc20s, provider]);

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
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
                {t.balance} {t.symbol}
              </div>
            </CardContent>
          ))}
        </Card>

        <Card>
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
        </Card>
      </LayoutContent>
    </LayoutContainer>
  );
}

const ERC_20_TOKENS = [
  {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    logoUrl:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
    balance: "0",
  },
].flatMap((t) => [t, t, t]);
