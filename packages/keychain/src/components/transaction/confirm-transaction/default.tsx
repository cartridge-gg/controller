import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useUsername } from "@/hooks/account";
import { normalizeAddress } from "@/utils/address";
import { LayoutContent, WalletType } from "@cartridge/ui";
import { useMemo } from "react";
import { Call, EstimateFee } from "starknet";
import { TransactionDestination } from "../destination";
import { TransactionSummary } from "../TransactionSummary";
import { ExecuteCtx } from "@/utils/connection";
import { useConnection } from "@/hooks/connection";

export const DefaultConfirmTransaction = ({
  transactions,
  onSubmit,
}: {
  transactions: Call[];
  onSubmit: (maxFee?: EstimateFee) => Promise<void>;
}) => {
  const { context } = useConnection();
  const ctx = context as ExecuteCtx;

  const calldata = useMemo(() => {
    const _call = transactions[0];

    if (_call) {
      if (Array.isArray(_call.calldata)) {
        const destinationAddress = normalizeAddress(String(_call.calldata[1]));
        return {
          destinationAddress,
        };
      }
    }

    return undefined;
  }, [transactions]);

  const { username: destinationUsername } = useUsername(
    calldata?.destinationAddress || "",
  );

  if (!calldata) {
    return undefined;
  }

  return (
    <ExecutionContainer
      title={`Review Transaction${transactions.length > 1 ? "s" : ""}`}
      executionError={ctx.error}
      transactions={transactions}
      feeEstimate={ctx.feeEstimate}
      onSubmit={onSubmit}
      buttonText="CONFIRM"
      className="select-none"
    >
      <LayoutContent className="gap-4">
        <TransactionDestination
          name={destinationUsername}
          address={calldata.destinationAddress}
          wallet={WalletType.Controller}
        />
        <TransactionSummary calls={transactions} />{" "}
      </LayoutContent>
    </ExecutionContainer>
  );
};
