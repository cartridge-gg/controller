import { useMemo } from "react";
import { getChecksumAddress, type Call } from "starknet";
import { TokenSwap } from "@/hooks/token";
import {
  decodeErc20TransferInputs,
  decodeEkuboClearMinimumInputs,
  decodeAvnuMultiRouteSwapInputs,
} from "@/hooks/calldata-decode";

// Each entry is an ordered sequence of entrypoints that constitutes a swap group.
// Add new DEX patterns here without changing any other logic.
const swapPatterns: string[][] = [
  [
    "transfer",
    "multihop_swap",
    "clear_minimum",
    "clear",
    "approve",
    "buy_game",
  ], // LS2
  ["transfer", "multihop_swap", "clear_minimum", "clear"], // Ekubo
  ["approve", "multi_route_swap"], // Avnu
];

const detectSwapGroups = (transactions: Call[]): Call[][] => {
  const groups: Call[][] = [];
  let i = 0;

  while (i < transactions.length) {
    const pattern = swapPatterns.find(
      (p) =>
        i + p.length <= transactions.length &&
        p.every((method, j) => transactions[i + j].entrypoint === method),
    );

    if (pattern) {
      groups.push(transactions.slice(i, i + pattern.length));
      i += pattern.length;
    } else {
      i++;
    }
  }

  return groups;
};

// detect swap transaction
// swap example in /examples/next/src/components/Profile.tsx
export const useIsSwapTransaction = (
  transactions: Call[],
): {
  isSwap: boolean;
} => {
  const swaps = useMemo(() => detectSwapGroups(transactions), [transactions]);
  return { isSwap: swaps.length > 0 };
};

export type SwapTransfers = {
  selling: TokenSwap[];
  buying: TokenSwap[];
};

export const useSwapTransactions = (
  transactions: Call[],
): {
  isSwap: boolean;
  swapTransfers: SwapTransfers;
  swapCount: number;
  swapTransactionCount: number;
  additionalTransactionCount: number;
} => {
  const swaps = useMemo(() => detectSwapGroups(transactions), [transactions]);

  const swapTransfers = useMemo(() => {
    const result: SwapTransfers = { selling: [], buying: [] };

    const addToken = (acc: TokenSwap[], address: string, amount: bigint) => {
      const token = acc.find((t) => t.address === address);
      if (token) {
        token.amount += amount;
      } else {
        acc.push({ address, amount });
      }
    };

    for (const group of swaps) {
      for (const call of group) {
        try {
          if (call.entrypoint === "transfer") {
            const input = decodeErc20TransferInputs(call.calldata as string[]);
            addToken(
              result.selling,
              getChecksumAddress(call.contractAddress),
              input.amount,
            );
          } else if (call.entrypoint === "clear_minimum") {
            const input = decodeEkuboClearMinimumInputs(
              call.calldata as string[],
            );
            addToken(
              result.buying,
              getChecksumAddress(input.token.contract_address),
              input.minimum,
            );
          } else if (call.entrypoint === "multi_route_swap") {
            const input = decodeAvnuMultiRouteSwapInputs(
              call.calldata as string[],
            );
            addToken(
              result.selling,
              getChecksumAddress(input.sell_token_address),
              input.sell_token_amount,
            );
            addToken(
              result.buying,
              getChecksumAddress(input.buy_token_address),
              input.buy_token_amount,
            );
          } else if (call.entrypoint === "buy_game") {
            result.buying = [];
            addToken(
              result.buying,
              getChecksumAddress(
                "0x036017e69d21d6d8c13e266eabb73ef1f1d02722d86bdcabe5f168f8e549d3cd",
              ),
              1n,
            );
          }
        } catch (error) {
          console.error(
            `[useSwapTransactions] Error decoding transaction inputs:`,
            call,
            error,
          );
          return null;
        }
      }
    }

    return result;
  }, [swaps]);

  const swapCount = swapTransfers != null ? swaps.length : 0;
  const swapTransactionCount = swaps.reduce(
    (acc, group) => acc + group.length,
    0,
  );
  const additionalTransactionCount = transactions.length - swapTransactionCount;

  return {
    isSwap: swapCount > 0,
    swapTransfers: swapTransfers ?? { selling: [], buying: [] },
    swapCount,
    swapTransactionCount,
    additionalTransactionCount,
  };
};
