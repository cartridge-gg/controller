import { useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Thumbnail,
} from "@cartridge/ui";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useTokens,
} from "@/hooks/tokens";
import type { ParsedSessionPolicies } from "@/hooks/session";
import { getChecksumAddress } from "starknet";
import makeBlockie from "ethereum-blockies-base64";

// Maximum value for uint256
const MAX_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

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
  const { tokens, registerPair } = useTokens();
  const registeredAddresses = useRef<Set<string>>(new Set());

  const tokenContracts = useMemo(() => {
    if (!policies?.contracts) return [];

    return Object.entries(policies.contracts).filter(([, contract]) => {
      return contract.methods.some((method) => method.entrypoint === "approve");
    });
  }, [policies]);

  // Register any tokens from policies that aren't in the TokensProvider
  useEffect(() => {
    tokenContracts.forEach(([address]) => {
      const checksumAddress = getChecksumAddress(address);
      // Only register if we haven't already tried and it's not in tokens
      if (
        !tokens[checksumAddress] &&
        !registeredAddresses.current.has(checksumAddress)
      ) {
        registeredAddresses.current.add(checksumAddress);
        registerPair(checksumAddress);
      }
    });
  }, [tokenContracts, tokens, registerPair]);

  if (tokenContracts.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between h-10">
        <CardTitle className="normal-case font-semibold text-xs text-foreground-300">
          Spending Limit
        </CardTitle>
      </CardHeader>

      {tokenContracts.map(([address, contract]) => {
        const amount =
          contract.methods.find((m) => m.entrypoint === "approve")?.amount ??
          "0";

        const checksumAddress = getChecksumAddress(address);
        const token = tokens[checksumAddress];

        // Use decimals and price from TokensProvider, with fallbacks to metadata
        const decimals = token?.decimals ?? contract.meta?.decimals ?? 18;
        const price = token?.price;
        const icon = token?.icon || contract.meta?.icon || makeBlockie(address);
        const symbol =
          token?.symbol || contract.meta?.symbol || contract.name || "";
        const name =
          token?.name || contract.name || contract.meta?.name || "Contract";

        const isUnlimited = BigInt(amount) >= BigInt(MAX_UINT256);

        // Format the token amount
        const formattedAmount = isUnlimited
          ? "Unlimited"
          : formatBalance(BigInt(amount), decimals);

        // Calculate USD value if price is available
        const usdValue =
          !isUnlimited && price
            ? convertTokenAmountToUSD(BigInt(amount), decimals, price)
            : null;

        return (
          <CardContent key={address} className="flex flex-row gap-3 p-3 w-full">
            <Thumbnail icon={icon} size="md" variant="lighter" rounded />
            <div className="flex flex-col w-full">
              <div className="w-full flex flex-row items-center justify-between text-sm font-medium text-foreground-100">
                <p>{name}</p>
                {showCost && !isUnlimited ? (
                  usdValue ? (
                    <p>{usdValue}</p>
                  ) : (
                    <Skeleton className="w-16 h-5" />
                  )
                ) : null}
              </div>
              <p className="text-foreground-400 text-xs font-medium">
                {isUnlimited ? "Unlimited" : `${formattedAmount} ${symbol}`}
              </p>
            </div>
          </CardContent>
        );
      })}
    </Card>
  );
}
