import {
  useCreateSession,
  type SessionContracts,
  type SessionMessages,
} from "@/hooks/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  CodeIcon,
  Thumbnail,
} from "@cartridge/ui";
import { useMemo } from "react";
import { AggregateCard } from "./AggregateCard";
import { ContractCard } from "./ContractCard";
import { TokenConsent } from "../connect/token-consent";
import { toArray } from "@cartridge/controller";

// Maximum value for uint128: 2^128 - 1
const MAX_UINT128 = "340282366920938463463374607431768211455";

function formatAmount(amount: string): string {
  const numAmount = BigInt(amount);
  const maxUint128 = BigInt(MAX_UINT128);

  if (numAmount >= maxUint128) {
    return "Unlimited";
  }

  return Number(amount).toString();
}

export function VerifiedSessionSummary({
  game,
  contracts,
  messages,
}: {
  game: string;
  contracts?: SessionContracts;
  messages?: SessionMessages;
}) {
  const { isEditable } = useCreateSession();
  // Separate contracts based on methods and type
  const { tokenContracts, otherContracts, vrfContracts } = useMemo(() => {
    const allContracts = Object.entries(contracts ?? {});

    const tokenContracts = allContracts.filter(([, contract]) => {
      const methods = toArray(contract.methods);
      return methods.some((method) => method.entrypoint === "approve");
    });

    const vrfContracts = allContracts.filter(([, contract]) => {
      return contract.meta?.type === "VRF";
    });

    const otherContracts = allContracts.filter(([, contract]) => {
      const methods = toArray(contract.methods);
      const hasApprove = methods.some(
        (method) => method.entrypoint === "approve",
      );
      const isVRF = contract.meta?.type === "VRF";
      return !hasApprove && !isVRF;
    });

    return { tokenContracts, otherContracts, vrfContracts };
  }, [contracts]);

  // Create aggregate contracts object for non-token, non-VRF contracts
  const aggregate = useMemo(() => {
    return {
      contracts: Object.fromEntries(otherContracts),
      messages,
    };
  }, [otherContracts, messages]);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-px">
        <AggregateCard
          title={game}
          icon={<CodeIcon variant="solid" />}
          contracts={aggregate.contracts}
          messages={messages}
          className={cn(vrfContracts.length > 0 && "rounded-b-none")}
        />

        {/* Render VRF contracts first */}
        {vrfContracts.map(([address, contract]) => (
          <ContractCard
            key={address}
            address={address}
            title={contract.name || contract.meta?.name || "Contract"}
            icon={contract.meta?.icon}
            methods={contract.methods}
            isExpanded={isEditable}
            className="rounded-none last:rounded-b"
          />
        ))}
      </div>

      {/* Render token contracts after */}
      {tokenContracts && tokenContracts.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
}
