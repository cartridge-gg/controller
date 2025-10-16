import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { TokenConsent } from "./token-consent";
import { type ParsedSessionPolicies } from "@/hooks/session";
import type { ControllerError } from "@/utils/connection";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Thumbnail,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { useMemo } from "react";
import { formatBalance } from "@/hooks/tokens";

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

export function SpendingLimitPage({
  policies,
  isConnecting,
  error,
  onBack,
  onConnect,
}: {
  policies: ParsedSessionPolicies;
  isConnecting: boolean;
  error?: ControllerError | Error;
  onBack: () => void;
  onConnect: () => void;
}) {
  const { theme } = useConnection();

  const tokenContracts = useMemo(() => {
    if (!policies?.contracts) return [];

    return Object.entries(policies.contracts).filter(([, contract]) => {
      return contract.methods.some((method) => method.entrypoint === "approve");
    });
  }, [policies]);

  return (
    <>
      <HeaderInner
        className="pb-0"
        title={
          theme.name.toLowerCase() === "cartridge"
            ? "Connect Controller"
            : `Connect to ${theme.name}`
        }
      />
      <LayoutContent className="pb-0">
        <div className="flex flex-col gap-4">
          <TokenConsent />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between h-10">
              <CardTitle className="normal-case font-semibold text-xs">
                Spending Limit
              </CardTitle>
            </CardHeader>

            {tokenContracts.map(([address, contract]) => {
              const amount =
                contract.methods.find((m) => m.entrypoint === "approve")
                  ?.amount ?? "0";

              return (
                <CardContent
                  key={address}
                  className="flex flex-row gap-3 p-3 w-full"
                >
                  <Thumbnail
                    icon={contract.meta?.icon}
                    size="md"
                    variant="lighter"
                    rounded
                  />
                  <div className="flex flex-col w-full">
                    <div className="w-full flex flex-row items-center justify-between text-sm font-medium text-foreground-100">
                      <p>
                        {contract.name || contract.meta?.name || "Contract"}
                      </p>
                      <p>{formatAmount(amount)}</p>
                    </div>
                    <p className="text-foreground-400 text-xs font-medium">
                      {formatAmount(amount)}
                    </p>
                  </div>
                </CardContent>
              );
            })}
          </Card>
        </div>
      </LayoutContent>
      <LayoutFooter className="pt-4">
        {error && <ControllerErrorAlert className="mb-3" error={error} />}

        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isConnecting}
            className="px-8"
          >
            Back
          </Button>
          <Button
            className="flex-1"
            disabled={isConnecting}
            isLoading={isConnecting}
            onClick={onConnect}
          >
            {policies.verified ? "play" : "confirm"}
          </Button>
        </div>

        {!error && <div className="flex flex-col" />}
      </LayoutFooter>
    </>
  );
}
