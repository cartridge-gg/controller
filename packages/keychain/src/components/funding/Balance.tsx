import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
  CoinsIcon,
} from "@cartridge/ui-next";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { formatEther } from "viem";
import {
  ETH_CONTRACT_ADDRESS,
  isIframe,
  useCountervalue,
  useCreditBalance,
  useERC20Balance,
} from "@cartridge/utils";
import { useController } from "@/hooks/controller";
import { useEffect, useState } from "react";
import Controller from "@/utils/controller";

export type BalanceType = "credits" | "eth" | "strk";

type BalanceProps = {
  showBalances: BalanceType[];
};

export function Balance({ showBalances }: BalanceProps) {
  const [username, setUsername] = useState<string>();
  const [address, setAddress] = useState<string>();
  const { controller } = useController();
  const { balance: creditBalance } = useCreditBalance({
    username: username,
    interval: 3000,
  });

  const {
    data: [eth],
  } = useERC20Balance({
    address: address,
    contractAddress: ETH_CONTRACT_ADDRESS,
    provider: controller,
    interval: 3000,
    decimals: 2,
  });
  const { countervalue } = useCountervalue(
    {
      balance: formatEther(eth?.balance.value ?? 0n),
      pair: TokenPair.EthUsdc,
    },
    { enabled: !!eth },
  );

  useEffect(() => {
    const activeController = isIframe()
      ? controller
      : Controller.fromStore(import.meta.env.VITE_ORIGIN!);

    if (activeController) {
      setUsername(activeController.username());
      setAddress(activeController.address);
    }
  }, [controller]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
      </CardHeader>

      <CardListContent>
        {showBalances.includes("credits") && (
          <CardListItem icon={<CoinsIcon variant="solid" />}>
            <div className="flex items-center gap-2">
              {creditBalance.formatted ?? 0}
              <span className="text-muted-foreground">CREDITS</span>
            </div>
          </CardListItem>
        )}

        {showBalances.includes("eth") && (
          <CardListItem icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo">
            <div className="flex items-center gap-2">
              {eth?.balance.formatted ?? "0.00"}
              <span className="text-muted-foreground">ETH</span>
            </div>

            {countervalue && (
              <div className="text-muted-foreground">
                {countervalue?.formatted}
              </div>
            )}
          </CardListItem>
        )}
      </CardListContent>
    </Card>
  );
}
