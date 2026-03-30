import { Abi, CallData, CallResult, FunctionAbi, InterfaceAbi } from "starknet";
import { erc20Abi } from "viem";

// ekubo abi from: https://voyager.online/contract/0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066#code
import ekuboRouterAbi from "@/components/swap/abis/ekuboRouterAbi.json" assert { type: "json" };
// avnu abi from: https://voyager.online/contract/0x4270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f#code
import avnuExchangeAbi from "@/components/swap/abis/avnuExchangeAbi.json" assert { type: "json" };

const decodeInputs = <T>(
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
  return result as T;
};

export type TransferInputs = {
  amount: bigint;
  recipient: string;
};

export type ApproveInputs = {
  spender: string;
  amount: bigint;
};

export type EkuboMultihopSwapInputs = {
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

export interface EkuboClearMinimumInputs {
  minimum: bigint;
  token: {
    contract_address: bigint;
  };
}

export interface EkuboClearInputs {
  minimum: bigint;
  token: {
    contract_address: bigint;
  };
}

export type AvnuMultiRouteSwapInputs = {
  sell_token_address: string;
  sell_token_amount: bigint;
  buy_token_address: string;
  buy_token_amount: bigint;
  buy_token_min_amount: bigint;
  beneficiary: string;
  integrator_fee_amount_bps: bigint;
  integrator_fee_recipient: string;
  routes: string[];
};

const decodeErc20TransferInputs = (args: string[]) => {
  return decodeInputs<TransferInputs>(erc20Abi, "ERC20", "transfer", args);
};

const decodeErc20ApproveInputs = (args: string[]) => {
  return decodeInputs<ApproveInputs>(erc20Abi, "ERC20", "approve", args);
};

const decodeEkuboMultihopSwapInputs = (args: string[]) => {
  return decodeInputs<EkuboMultihopSwapInputs>(
    ekuboRouterAbi,
    "ekubo::router::IRouter",
    "multihop_swap",
    args,
  );
};

const decodeEkuboClearMinimumInputs = (args: string[]) => {
  return decodeInputs<EkuboClearMinimumInputs>(
    ekuboRouterAbi,
    "ekubo::components::clear::IClear",
    "clear_minimum",
    args,
  );
};

const decodeEkuboClearInputs = (args: string[]) => {
  return decodeInputs<EkuboClearInputs>(
    ekuboRouterAbi,
    "ekubo::components::clear::IClear",
    "clear",
    args,
  );
};

const decodeAvnuMultiRouteSwapInputs = (args: string[]) => {
  const argsWithoutRoutes = [...args.slice(0, 11), "0x0"];
  return decodeInputs<AvnuMultiRouteSwapInputs>(
    avnuExchangeAbi,
    "avnu::exchange::IExchange",
    "multi_route_swap",
    argsWithoutRoutes,
  );
};

export {
  //erc20
  decodeErc20TransferInputs,
  decodeErc20ApproveInputs,
  // Ekubo
  decodeEkuboMultihopSwapInputs,
  decodeEkuboClearMinimumInputs,
  decodeEkuboClearInputs,
  // Avnu
  decodeAvnuMultiRouteSwapInputs,
};
