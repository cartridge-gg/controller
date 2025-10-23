import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Thumbnail,
} from "@cartridge/ui";
import { convertTokenAmountToUSD } from "@/hooks/tokens";
import type { ParsedSessionPolicies } from "@/hooks/session";
import { usePriceByAddressesQuery } from "@cartridge/ui/utils/api/cartridge";
import { getChecksumAddress } from "starknet";

// Maximum value for uint128: 2^128 - 1
const MAX_UINT128 = "340282366920938463463374607431768211455";

interface SpendingLimitCardProps {
  className?: string;
  policies: ParsedSessionPolicies;
  showCost?: boolean;
}

export function SpendingLimitCard({
  className,
  policies,
  showCost = true,
}: SpendingLimitCardProps) {
  const tokenContracts = useMemo(() => {
    if (!policies?.contracts) return [];

    return Object.entries(policies.contracts).filter(([, contract]) => {
      return contract.methods.some((method) => method.entrypoint === "approve");
    });
  }, [policies]);

  const { data: tokenPrices } = usePriceByAddressesQuery({
    addresses: tokenContracts.map(([address]) => address),
  });

  // Create a map of address to price for easy lookup
  const priceMap = useMemo(() => {
    if (!tokenPrices?.priceByAddresses) return {};

    const map: Record<string, { amount: string; decimals: number }> = {};
    tokenPrices.priceByAddresses.forEach((price) => {
      const checksumAddress = getChecksumAddress(price.base);
      map[checksumAddress] = {
        amount: price.amount,
        decimals: price.decimals,
      };
    });
    return map;
  }, [tokenPrices]);

  if (tokenContracts.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between h-10">
        <CardTitle className="normal-case font-semibold text-xs">
          Spending Limit
        </CardTitle>
      </CardHeader>

      {tokenContracts.map(([address, contract]) => {
        const amount =
          contract.methods.find((m) => m.entrypoint === "approve")?.amount ??
          "0";

        const checksumAddress = getChecksumAddress(address);
        const price = priceMap[checksumAddress];
        const decimals = contract.meta?.decimals ?? 18;
        const isUnlimited = BigInt(amount) >= BigInt(MAX_UINT128);

        // Format the token amount
        const formattedAmount = isUnlimited ? "Unlimited" : Number(amount);

        // Calculate USD value if price is available
        const usdValue =
          !isUnlimited && price
            ? convertTokenAmountToUSD(BigInt(amount), decimals, price)
            : "Unlimited";

        return (
          <CardContent key={address} className="flex flex-row gap-3 p-3 w-full">
            <Thumbnail
              icon={contract.meta?.icon}
              size="md"
              variant="lighter"
              rounded
            />
            <div className="flex flex-col w-full">
              <div className="w-full flex flex-row items-center justify-between text-sm font-medium text-foreground-100">
                <p>{contract.name || contract.meta?.name || "Contract"}</p>
                {showCost && usdValue ? <p>{usdValue}</p> : null}
              </div>
              <p className="text-foreground-400 text-xs font-medium">
                {isUnlimited
                  ? "Unlimited"
                  : `${formattedAmount} ${contract.meta?.symbol || contract.name || ""}`}
              </p>
            </div>
          </CardContent>
        );
      })}
    </Card>
  );
}
