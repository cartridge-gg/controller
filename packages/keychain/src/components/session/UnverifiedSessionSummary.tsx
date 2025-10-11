import {
  useCreateSession,
  type SessionContracts,
  type SessionMessages,
} from "@/hooks/session";
import { toArray } from "@cartridge/controller";

import { ContractCard } from "./ContractCard";
import { MessageCard } from "./MessageCard";
import { useMemo } from "react";
import { TokenConsent } from "../connect/token-consent";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Thumbnail,
} from "@cartridge/ui";
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

export function UnverifiedSessionSummary({
  contracts,
  messages,
  hideSpendingLimit,
}: {
  contracts?: SessionContracts;
  messages?: SessionMessages;
  hideSpendingLimit?: boolean;
}) {
  const { isEditable } = useCreateSession();
  const { tokenContracts, otherContracts } = useMemo(() => {
    const formattedContracts = Object.entries(contracts ?? {}).map(
      ([address, contract]) => {
        const methods = toArray(contract.methods);
        const title = !contract.meta?.name ? "Contract" : contract.meta.name;
        const icon = contract.meta?.icon;

        return {
          address,
          title,
          icon,
          methods,
        };
      },
    );

    // Separate token contracts (with approve method) from other contracts
    const tokenContracts = formattedContracts.filter((contract) =>
      contract.methods.some((method) => method.entrypoint === "approve"),
    );

    const otherContracts = formattedContracts.filter(
      (contract) =>
        !contract.methods.some((method) => method.entrypoint === "approve"),
    );

    return { tokenContracts, otherContracts };
  }, [contracts]);

  return (
    <div className="flex flex-col gap-4">
      {/* Render other contracts first */}
      <div className="space-y-px">
        {otherContracts.map((e) => (
          <ContractCard
            key={e.address}
            address={e.address}
            title={e.title}
            icon={e.icon}
            methods={e.methods}
            isExpanded={isEditable}
            className={cn(
              "rounded-none first:rounded-t",
              messages && messages.length > 0 && "last:rounded-b-none",
            )}
          />
        ))}
        {messages && messages.length > 0 && (
          <MessageCard
            className={cn(otherContracts && "rounded-t-none")}
            messages={messages}
          />
        )}
      </div>

      {/* Render token contracts after */}
      {!hideSpendingLimit && tokenContracts && tokenContracts.length > 0 && (
        <>
          <TokenConsent />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between h-10">
              <CardTitle className="normal-case font-semibold text-xs">
                Spending Limit
              </CardTitle>
            </CardHeader>

            {tokenContracts.map(({ title, icon, methods, address }) => {
              const amount =
                methods.find((m) => m.entrypoint === "approve")?.amount ?? "0";

              return (
                <CardContent
                  key={address}
                  className="flex flex-row gap-3 p-3 w-full"
                >
                  <Thumbnail icon={icon} size="md" variant="lighter" rounded />
                  <div className="flex flex-col w-full">
                    <div className="w-full flex flex-row items-center justify-between text-sm font-medium text-foreground-100">
                      <p>{title}</p>
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
        </>
      )}
    </div>
  );
}
