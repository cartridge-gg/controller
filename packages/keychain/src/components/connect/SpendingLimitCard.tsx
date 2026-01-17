import { useEffect, useMemo, useRef } from "react";
import {
  AlertIcon,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
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
const UNLIMITED_VALUE = "0xffffffffffffffffffffffffffffffff";

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

  const processedTokens = useMemo(() => {
    if (!policies?.contracts) return [];

    const result = Object.entries(policies.contracts)
      .map(([address, contract]) => {
        const approveMethod = contract.methods.find(
          (m) => m.entrypoint === "approve",
        );

        if (!approveMethod) return null;

        const amount = approveMethod.amount ?? "0";
        const checksumAddress = getChecksumAddress(address);
        const token = tokens[checksumAddress];

        // Pre-compute all values
        const decimals = token?.decimals ?? contract.meta?.decimals ?? 18;
        const price = token?.price;
        const icon = token?.icon || contract.meta?.icon || makeBlockie(address);
        const symbol =
          token?.symbol || contract.meta?.symbol || contract.name || "";
        const name =
          token?.name || contract.name || contract.meta?.name || "Contract";

        const amountBigInt = BigInt(amount);
        const isUnlimited = amountBigInt >= BigInt(UNLIMITED_VALUE);

        // Pre-compute formatted values
        const formattedAmount = isUnlimited
          ? "Unlimited"
          : formatBalance(amountBigInt, decimals);

        const usdValue =
          !isUnlimited && price
            ? convertTokenAmountToUSD(amountBigInt, decimals, price)
            : "Unlimited";

        return {
          address: checksumAddress,
          icon,
          name,
          symbol,
          decimals,
          price,
          isUnlimited,
          formattedAmount,
          usdValue,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return result;
  }, [policies?.contracts, tokens]);

  // Register any tokens from policies that aren't in the TokensProvider
  useEffect(() => {
    if (!policies?.contracts) return;

    Object.keys(policies.contracts).forEach((address) => {
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
  }, [policies?.contracts, tokens, registerPair]);

  if (processedTokens.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between h-10">
        <CardTitle className="normal-case font-semibold text-xs text-foreground-300">
          Spending Limit
        </CardTitle>
      </CardHeader>

      {processedTokens.map((token) => (
        <CardContent
          key={token.address}
          className="flex flex-row gap-3 p-3 w-full"
        >
          <Thumbnail icon={token.icon} size="md" variant="lighter" rounded />
          <div className="flex flex-col w-full">
            <div className="w-full flex flex-row items-center justify-between text-sm font-medium">
              <p className="text-foreground-100">{token.name}</p>
              {showCost ? (
                token.isUnlimited || token.price ? (
                  <div className="flex flex-row items-center gap-1">
                    <Thumbnail
                      className={cn(!token.isUnlimited && "hidden")}
                      size="xs"
                      icon={
                        <AlertIcon className="!w-4 !h-4 text-destructive-100" />
                      }
                      centered={true}
                    />
                    <p
                      className={cn(
                        token.isUnlimited
                          ? "text-destructive-100"
                          : "text-foreground-100",
                      )}
                    >
                      {token.usdValue}
                    </p>
                  </div>
                ) : (
                  <Skeleton className="w-16 h-5" />
                )
              ) : null}
            </div>
            <p className="text-foreground-400 text-xs font-medium">
              {token.isUnlimited
                ? `Unlimited ${token.symbol}`
                : `${token.formattedAmount} ${token.symbol}`}
            </p>
          </div>
        </CardContent>
      ))}
    </Card>
  );
}
