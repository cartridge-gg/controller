import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Thumbnail,
} from "@cartridge/ui";
import { formatBalance } from "@/hooks/tokens";
import type { ParsedSessionPolicies } from "@/hooks/session";

// Maximum value for uint128: 2^128 - 1
const MAX_UINT128 = "340282366920938463463374607431768211455";

function formatAmount(amount: string | number): string {
  const numAmount = BigInt(amount);
  const maxUint128 = BigInt(MAX_UINT128);

  if (numAmount >= maxUint128) {
    return "Unlimited";
  }

  return formatBalance(numAmount, 18);
}

export function SpendingLimitCard({
  className,
  policies,
}: {
  className?: string;
  policies: ParsedSessionPolicies;
}) {
  const tokenContracts = useMemo(() => {
    if (!policies?.contracts) return [];

    return Object.entries(policies.contracts).filter(([, contract]) => {
      return contract.methods.some((method) => method.entrypoint === "approve");
    });
  }, [policies]);

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
                <p>{formatAmount(amount)}</p>
              </div>
              <p className="text-foreground-400 text-xs font-medium">
                {`${formatAmount(amount)} ${contract.name || contract.meta?.name || "Contract"}`}
              </p>
            </div>
          </CardContent>
        );
      })}
    </Card>
  );
}
