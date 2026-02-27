import { useMemo } from "react";
import { getChecksumAddress, type Call } from "starknet";
import { useDecodeTransactionInputs } from "@/hooks/calldata-decode";
import { TokenSwap } from "@/hooks/token";

const findTransactions = (transactions: Call[], entrypoint: string) => {
  return transactions.filter((t) => t.entrypoint === entrypoint);
};

// detect swap transaction
// swap example in /examples/next/src/components/Profile.tsx
export const useIsSwapTransaction = (
  transactions: Call[],
): {
  isSwap: boolean;
} => {
  const isSwap = useMemo(
    () =>
      transactions.length >= 4 &&
      findTransactions(transactions, "transfer").length > 0 &&
      findTransactions(transactions, "multihop_swap").length > 0 &&
      findTransactions(transactions, "clear_minimum").length > 0 &&
      findTransactions(transactions, "clear").length > 0,
    [transactions],
  );
  return { isSwap };
};

export type SwapTransactions = {
  selling: TokenSwap[];
  buying: TokenSwap[];
};

export const useSwapTransactions = (
  transactions: Call[],
): {
  isSwap: boolean;
  swapTransactions: SwapTransactions;
  swapMethodCount: number;
  additionalMethodCount: number;
} => {
  const { isSwap } = useIsSwapTransaction(transactions);

  const { decodeTransferInputs, decodeClearMinimumInputs } =
    useDecodeTransactionInputs();

  const [swapTransactions, swapMethodCount] = useMemo(() => {
    const swapTransactions: SwapTransactions = {
      selling: [],
      buying: [],
    };
    if (!isSwap) return [swapTransactions, 0];

    const transfers = findTransactions(transactions, "transfer");
    const multihop_swaps = findTransactions(transactions, "multihop_swap");
    const clear_minimuns = findTransactions(transactions, "clear_minimum");
    const clears = findTransactions(transactions, "clear");

    const transferInputs = transfers.map((transfer) =>
      decodeTransferInputs(transfer.calldata as string[]),
    );
    const clearInputs = clear_minimuns.map((clear_minimum) =>
      decodeClearMinimumInputs(clear_minimum.calldata as string[]),
    );

    const addToken = (acc: TokenSwap[], address: string, amount: bigint) => {
      const token = acc.find((t) => t.address === address);
      if (token) {
        token.amount += amount;
      } else {
        acc.push({ address, amount });
      }
      return acc;
    };

    swapTransactions.selling = transferInputs.reduce((acc, input, index) => {
      return addToken(
        acc,
        getChecksumAddress(transfers[index].contractAddress),
        input.amount,
      );
    }, [] as TokenSwap[]);

    swapTransactions.buying = clearInputs.reduce((acc, input) => {
      return addToken(
        acc,
        getChecksumAddress(input.token.contract_address),
        input.minimum,
      );
    }, [] as TokenSwap[]);

    const count =
      transfers.length +
      multihop_swaps.length +
      clear_minimuns.length +
      clears.length;

    return [swapTransactions, count];
  }, [isSwap, transactions, decodeClearMinimumInputs, decodeTransferInputs]);

  return {
    isSwap,
    swapTransactions,
    swapMethodCount,
    additionalMethodCount: transactions.length - swapMethodCount,
  };
};
