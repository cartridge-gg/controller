import { useCallback } from "react";
import { Abi, CallData, CallResult, FunctionAbi, InterfaceAbi } from "starknet";
import { erc20Abi } from "viem";

// ekubo abi from:
// https://voyager.online/contract/0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066#code
import ekuboRouterAbi from "@/components/swap/ekuboRouterAbi.json" assert { type: "json" };

const useDecodeCallbackInputs = () => {
  const decodeInputs = useCallback(
    <T>(abi: Abi, interfaceName: string, method: string, args: string[]) => {
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
      return result as T;
    },
    [],
  );
  return { decodeInputs };
};

export type TransferInputs = {
  amount: bigint;
  recipient: string;
};

export type MultihopSwapInputs = {
  route: [
    {
      pool_key: {
        token0: bigint;
        token1: bigint;
        fee: bigint;
        tick_spacing: bigint;
        extension: bigint;
      };
      sqrt_ratio_limit: bigint;
      skip_ahead: bigint;
    },
  ];
  token_amount: {
    token: bigint;
    amount: {
      mag: bigint;
      sign: boolean;
    };
  };
};

export interface ClearMinimumInputs {
  minimum: bigint;
  token: {
    contract_address: bigint;
  };
}

export interface ClearInputs {
  minimum: bigint;
  token: {
    contract_address: bigint;
  };
}

export const useDecodeTransactionInputs = () => {
  const { decodeInputs } = useDecodeCallbackInputs();

  const decodeTransferInputs = useCallback(
    (args: string[]) => {
      return decodeInputs<TransferInputs>(erc20Abi, "ERC20", "transfer", args);
    },
    [decodeInputs],
  );

  const decodeMultihopSwapInputs = useCallback(
    (args: string[]) => {
      return decodeInputs<MultihopSwapInputs>(
        ekuboRouterAbi,
        "ekubo::router::IRouter",
        "multihop_swap",
        args,
      );
    },
    [decodeInputs],
  );

  const decodeClearMinimumInputs = useCallback(
    (args: string[]) => {
      return decodeInputs<ClearMinimumInputs>(
        ekuboRouterAbi,
        "ekubo::components::clear::IClear",
        "clear_minimum",
        args,
      );
    },
    [decodeInputs],
  );

  const decodeClearInputs = useCallback(
    (args: string[]) => {
      return decodeInputs<ClearInputs>(
        ekuboRouterAbi,
        "ekubo::components::clear::IClear",
        "clear",
        args,
      );
    },
    [decodeInputs],
  );

  return {
    decodeTransferInputs,
    decodeMultihopSwapInputs,
    decodeClearMinimumInputs,
    decodeClearInputs,
  };
};
