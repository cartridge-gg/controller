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
} from "@cartridge/controller-ui";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useTokens,
} from "@/hooks/tokens";
import type { ParsedSessionPolicies } from "@/hooks/session";
import { getChecksumAddress } from "starknet";
import makeBlockie from "ethereum-blockies-base64";
import { Price } from "@/utils/api";

// Maximum value for uint256
const UNLIMITED_VALUE = "0xffffffffffffffffffffffffffffffff";

interface SpendingLimitCardProps {
  className?: string;
  policies: ParsedSessionPolicies;
  showCost?: boolean;
}

interface SpendingLimitTokens {
  address: string;
  icon: string | React.ReactNode;
  name: string;
  symbol: string;
  decimals: number;
  price: Price | undefined;
  isUnlimited: boolean;
  formattedAmount: string;
  usdValue: string;
  usdAmount: number | undefined;
}

export function SpendingLimitCard({
  className,
  policies,
  showCost = true,
}: SpendingLimitCardProps) {
  const { tokens, registerPair, isLoading } = useTokens();
  const registeredAddresses = useRef<Set<string>>(new Set());

  const processedTokens = useMemo<SpendingLimitTokens[]>(() => {
    if (!policies?.contracts) return [];

    const result = Object.entries(policies.contracts)
      .map(([address, contract]) => {
        const approveMethod = contract.methods.find(
          (m) => m.entrypoint === "approve",
        );

        if (!approveMethod) return null;

        const amount =
          approveMethod.amount === "*"
            ? UNLIMITED_VALUE
            : (approveMethod.amount ?? "0");
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

        const usdAmount =
          !isUnlimited && price
            ? Number(
                (amountBigInt * BigInt(price.amount)) / BigInt(10 ** decimals),
              ) /
              10 ** price.decimals
            : undefined;

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
          usdAmount,
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

  return policies.verified ? (
    <SpendingLimitCardInnerVerified
      className={className}
      showCost={showCost}
      isLoading={isLoading}
      processedTokens={processedTokens}
    />
  ) : (
    <SpendingLimitCardInnerUnverified
      className={className}
      showCost={showCost}
      isLoading={isLoading}
      processedTokens={processedTokens}
    />
  );
}

interface SpendingLimitCarInnerProps {
  className?: string;
  showCost: boolean;
  isLoading: boolean;
  processedTokens: SpendingLimitTokens[];
}

function SpendingLimitCardInnerUnverified({
  className,
  showCost,
  isLoading,
  processedTokens,
}: SpendingLimitCarInnerProps) {
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
                  isLoading && <Skeleton className="w-16 h-5" />
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

function SpendingLimitCardInnerVerified({
  className,
  showCost,
  isLoading,
  processedTokens,
}: SpendingLimitCarInnerProps) {
  const hasUnlimited = processedTokens.some((t) => t.isUnlimited);
  const totalUsd = processedTokens.reduce(
    (sum, t) => sum + (t.usdAmount ?? 0),
    0,
  );
  const formattedTotal = totalUsd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Card className={className}>
      <CardContent className="flex flex-col gap-2 p-3 w-full">
        <div className="flex flex-col gap-1">
          <div className="w-full flex flex-row items-center justify-between text-sm font-medium">
            <p className="text-foreground-100">Spending Limit</p>
            {showCost ? (
              isLoading ? (
                <Skeleton className="w-20 h-5" />
              ) : hasUnlimited ? (
                <div className="flex flex-row items-center gap-1">
                  <Thumbnail
                    size="xs"
                    icon={
                      <AlertIcon className="!w-4 !h-4 text-destructive-100" />
                    }
                    centered
                  />
                  <p className="text-destructive-100">Unlimited</p>
                </div>
              ) : (
                <p className="text-foreground-100">{formattedTotal}</p>
              )
            ) : null}
          </div>
          <p className="text-foreground-400 text-xs font-medium">
            {`${processedTokens.length} Token${processedTokens.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {isLoading ? (
          <Skeleton className="w-full h-8" />
        ) : (
          <div className="flex flex-row items-center gap-1 flex-wrap w-full h-8">
            {processedTokens.map((token) => (
              <Thumbnail
                key={token.address}
                icon={token.icon}
                size="md"
                variant="lighter"
                rounded
                className="-mr-3"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
