import { useMemo } from "react";
import {
  Abi,
  CallData,
  CallResult,
  FunctionAbi,
  getChecksumAddress,
  InterfaceAbi,
  type Call,
} from "starknet";

// abi from: https://voyager.online/contract/0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066#code
import ekuboRouterAbi from "./ekuboRouterAbi.json" assert { type: "json" };
import { erc20Abi } from "viem";

// detect swap transaction
// swap example in /examples/next/src/components/Profile.tsx
export const useIsSwapTransaction = (
  transactions: Call[],
): {
  isSwap: boolean;
} => {
  const isSwap = useMemo(
    () =>
      transactions.length === 4 &&
      transactions[0].entrypoint === "transfer" &&
      transactions[1].entrypoint === "multihop_swap" &&
      transactions[2].entrypoint === "clear_minimum" &&
      transactions[3].entrypoint === "clear",
    [transactions],
  );

  return { isSwap };
};

type TransferInputs = {
  amount: bigint;
  recipient: string;
};

// type SwapInputs = {
//   route: [
//     {
//       pool_key: {
//         token0: bigint;
//         token1: bigint;
//         fee: bigint;
//         tick_spacing: bigint;
//         extension: bigint;
//       };
//       sqrt_ratio_limit: bigint;
//       skip_ahead: bigint;
//     },
//   ];
//   token_amount: {
//     token: bigint;
//     amount: {
//       mag: bigint;
//       sign: boolean;
//     };
//   };
// };

type ClearMinimumInputs = {
  minimum: bigint;
  token: {
    contract_address: bigint;
  };
};

export type SwapTransaction = {
  sellAddress: string;
  sellAmount: string;
  buyAddress: string;
  buyAmount: string;
};

export const useSwapTransaction = (
  transactions: Call[],
): {
  isSwap: boolean;
  swapTransaction: SwapTransaction;
} => {
  const { isSwap } = useIsSwapTransaction(transactions);
  const swapTransaction = useMemo(() => {
    if (!isSwap) return {} as SwapTransaction;

    const transfer = transactions.find((t) => t.entrypoint === "transfer");
    const multihop_swap = transactions.find(
      (t) => t.entrypoint === "multihop_swap",
    );
    const clear_minimum = transactions.find(
      (t) => t.entrypoint === "clear_minimum",
    );
    const clear = transactions.find((t) => t.entrypoint === "clear");
    if (!transfer || !multihop_swap || !clear_minimum || !clear) {
      return {} as SwapTransaction;
    }

    const parseInputs = (
      abi: Abi,
      interfaceName: string,
      method: string,
      args: string[],
    ) => {
      const interfaceAbi = abi.find(
        (a) => a.name === interfaceName,
      ) as InterfaceAbi;
      const { inputs } = (interfaceAbi?.items ?? abi).find(
        (a) => a.name === method,
      ) as FunctionAbi;
      const callData = new CallData(abi);
      const decoded = callData.decodeParameters(
        inputs.map((i) => i.type),
        args,
      );
      const result = inputs.reduce(
        (acc, input, index) => {
          acc[input.name] = Array.isArray(decoded) ? decoded[index] : decoded;
          return acc;
        },
        {} as { [key: string]: CallResult },
      );
      return result;
    };

    // CallResult is typed, but we can't get the typescript types from them...
    const transferInputs = parseInputs(
      erc20Abi,
      "IERC20",
      "transfer",
      transfer.calldata as string[],
    ) as TransferInputs;
    // const swapInputs = parseInputs(
    //   ekuboRouterAbi,
    //   "ekubo::router::IRouter",
    //   "multihop_swap",
    //   multihop_swap.calldata as string[],
    // ) as SwapInputs;
    const clearMinimumInputs = parseInputs(
      ekuboRouterAbi,
      "ekubo::components::clear::IClear",
      "clear_minimum",
      clear_minimum.calldata as string[],
    ) as ClearMinimumInputs;

    const swapTransaction: SwapTransaction = {
      sellAddress: getChecksumAddress(transfer.contractAddress),
      sellAmount: `0x${BigInt(transferInputs.amount).toString(16)}`,
      buyAddress: getChecksumAddress(clearMinimumInputs.token.contract_address),
      buyAmount: `0x${BigInt(clearMinimumInputs.minimum).toString(16)}`,
    };
    return swapTransaction;
  }, [isSwap, transactions]);

  return { isSwap, swapTransaction };
};
