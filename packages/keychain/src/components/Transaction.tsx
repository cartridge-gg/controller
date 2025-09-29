import { ReactNode, useEffect, useMemo, useState } from "react";
import { constants } from "starknet";
import { CheckIcon, ExternalIcon, Spinner, StarknetIcon } from "@cartridge/ui";
import { useController } from "@/hooks/controller";
import { useChainName } from "@/hooks/chain";
import { useExplorer } from "@starknet-react/core";
import { Link } from "react-router-dom";

export type TransactionState = "pending" | "success" | "error";

export interface TransactionProps {
  name: string;
  hash: string;
  chainId: constants.StarknetChainId;
  finalized?: (transactionState: TransactionState) => void;
}

export function Transaction({
  name,
  chainId,
  hash,
  finalized,
}: TransactionProps) {
  const [state, setState] = useState<TransactionState>("pending");
  const { icon } = useMemo(() => getColorIcon(state), [state]);
  const { controller } = useController();
  const explorer = useExplorer();

  useEffect(() => {
    if (chainId && controller) {
      let result: TransactionState = "pending";
      controller.provider
        .waitForTransaction(hash, {
          retryInterval: 8000,
        })
        .then(() => {
          result = "success";
        })
        .catch((e) => {
          result = "error";
          console.error(e);
        })
        .finally(() => {
          setState(result);
          if (finalized) finalized(result);
        });
    }
  }, [controller, hash, chainId, finalized]);

  const chainName = useChainName(chainId);

  return (
    <div className="flex items-center bg-background-200 roudned p-3 text-sm justify-between">
      <div className="flex items-center gap-1">
        {icon}
        <div>{name}</div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center text-foreground-400 gap-1 border-r px-3">
          <StarknetIcon size="sm" />
          <div>{chainName}</div>
        </div>
        <Link to={explorer.transaction(hash)} target="_blank">
          <ExternalIcon size="sm" />
        </Link>
      </div>
    </div>
  );
}

function getColorIcon(state: TransactionState): {
  icon: ReactNode;
} {
  switch (state) {
    case "success":
      return {
        icon: <CheckIcon className="text-[#0EAD69]" size="xs" />,
      };
    case "pending":
      return {
        icon: <Spinner />,
      };
    case "error":
      return {
        icon: <></>,
      };
  }
}
