import {
  getChecksumAddress,
  hash,
  uint256,
  RPC,
  RpcProvider,
  type SimulateTransactionOverhead,
} from "starknet";
import { erc20Metadata } from "@cartridge/presets";

export interface SimulationEvent {
  contractAddress: string;
  contractType: ContractType | undefined;
  entryPointSelector: string;
  keys: string[];
  data: string[];
  values: bigint[];
  // derived
  eventName?: string;
}

export type ContractType = "ERC20" | "ERC721" | "ERC1155";

export interface SimulationBalance {
  contractAddress: string;
  contractType: ContractType;
  balance: bigint;
  allowance: bigint;
  approvedAll: boolean;
}

export const isErc20Contract = async (
  provider: RpcProvider,
  contractAddress: string,
) => {
  try {
    // check if it's a known ERC20 contract
    if (
      erc20Metadata.find(
        (t) => BigInt(t.l2_token_address) === BigInt(contractAddress),
      ) !== undefined
    ) {
      return true;
    }
    // fallback to call contract
    const resp = await provider.callContract({
      contractAddress,
      entrypoint: "decimals",
      calldata: [],
    });
    return BigInt(resp?.[0] ?? 0) > 0n;
  } catch {
    return false;
  }
};

const IERC721_ID =
  "0x33eb2f84c309543403fd69f0d0f363781ef06ef6faeb0131ff16ea3175bd943";
export const isErc721Contract = async (
  provider: RpcProvider,
  contractAddress: string,
) => {
  try {
    const resp = await provider.callContract({
      contractAddress,
      entrypoint: "supports_interface",
      calldata: [IERC721_ID],
    });
    return BigInt(resp?.[0] ?? 0) > 0n;
  } catch {
    return false;
  }
};

const IERC1155_ID =
  "0x6114a8f75559e1b39fcba08ce02961a1aa082d9256a158dd3e64964e4b1b52";
export const isErc1155Contract = async (
  provider: RpcProvider,
  contractAddress: string,
) => {
  try {
    const resp = await provider.callContract({
      contractAddress,
      entrypoint: "supports_interface",
      calldata: [IERC1155_ID],
    });
    return BigInt(resp?.[0] ?? 0) > 0n;
  } catch {
    return false;
  }
};

//-----------------------------------------
// extract events from simulation
//
export const parseSimulationEvents = async (
  responses: SimulateTransactionOverhead[],
  provider: RpcProvider,
  caller?: bigint | undefined,
): Promise<SimulationEvent[]> => {
  const result: SimulationEvent[] = [];

  const calls = responses.reduce((acc, response) => {
    const trace = response.transaction_trace as RPC.RPCSPEC09.INVOKE_TXN_TRACE;
    if (!trace) {
      return acc;
    }
    const calls = trace.execute_invocation
      .calls as RPC.RPCSPEC09.FUNCTION_INVOCATION[];

    const _concatCalls = (
      acc: RPC.RPCSPEC09.FUNCTION_INVOCATION[],
      calls: RPC.RPCSPEC09.FUNCTION_INVOCATION[] | undefined,
    ) => {
      if (calls) {
        calls.forEach((call) => {
          acc.push(call);
          _concatCalls(acc, call.calls);
        });
      }
      return acc;
    };
    return _concatCalls(acc, calls);
  }, [] as RPC.RPCSPEC09.FUNCTION_INVOCATION[]);

  for (const call of calls) {
    const contractAddress: string = getChecksumAddress(call.contract_address);
    const entryPointSelector: string = call.entry_point_selector;
    const events: RPC.RPCSPEC09.ORDERED_EVENT[] = call.events;

    for (const e of events) {
      const entry: SimulationEvent = {
        contractAddress,
        contractType: undefined,
        entryPointSelector,
        keys: [...e.keys],
        data: [...e.data],
        values: [
          ...e.keys.slice(1), // 1st key is selector
          ...e.data,
        ].map((v) => BigInt(v)),
      };

      // skip if caller is not involved
      if (caller && !entry.values.includes(caller)) {
        continue;
      }

      // find storage by name
      const eventName = findEventName(entry.keys[0] ?? "");
      if (eventName) {
        entry.eventName = eventName;
      }

      result.push(entry);
    }
  }

  // get list of contracts (known events only)
  const contracts = result
    .filter((event) => Boolean(event.eventName))
    .reduce(
      (acc, event) => {
        if (!acc[event.contractAddress]) {
          acc[event.contractAddress] = undefined;
        }
        return acc;
      },
      {} as Record<string, ContractType | undefined>,
    );

  // get contract types
  for (const contractAddress of Object.keys(contracts)) {
    if (await isErc20Contract(provider, contractAddress)) {
      contracts[contractAddress] = "ERC20";
    } else if (await isErc721Contract(provider, contractAddress)) {
      contracts[contractAddress] = "ERC721";
    } else if (await isErc1155Contract(provider, contractAddress)) {
      contracts[contractAddress] = "ERC1155";
    }
  }

  // update result
  for (const event of result) {
    event.contractType = contracts[event.contractAddress];
  }

  return result;
};

const eventNames = [
  //
  // ERC-20
  // https://github.com/OpenZeppelin/cairo-contracts/blob/release-v1.0.0/packages/token/src/erc20/erc20.cairo
  "Transfer",
  "Approval",
  //
  // ERC-721
  // https://github.com/OpenZeppelin/cairo-contracts/blob/release-v1.0.0/packages/token/src/erc721/erc721.cairo
  "Transfer",
  "Approval",
  "ApprovalForAll",
  //
  // ERC-1155
  // https://github.com/OpenZeppelin/cairo-contracts/blob/release-v1.0.0/packages/token/src/erc1155/erc1155.cairo
  "TransferSingle",
  "TransferBatch",
  "ApprovalForAll",
];

const findEventName = (key: string): string | undefined => {
  for (const eventName of eventNames) {
    if (BigInt(key) == hash.starknetKeccak(eventName)) {
      return eventName;
    }
  }
  return undefined;
};

//-----------------------------------------
// consolitate simulation events
//

export const consolidateSimulationEvents = (
  events: SimulationEvent[],
  caller: bigint,
): SimulationBalance[] => {
  //--------------------------
  // ERC20
  //
  const erc20Events: {
    contractAddress: string;
    balance: bigint;
    allowances: Record<string, bigint>;
  }[] = [];
  for (const event of events) {
    if (event.contractType !== "ERC20") continue;

    let erc20Event = erc20Events.find(
      (e) => e.contractAddress === event.contractAddress,
    );
    if (!erc20Event) {
      erc20Event = {
        contractAddress: event.contractAddress,
        balance: 0n,
        allowances: {},
      };
      erc20Events.push(erc20Event);
    }

    if (event.eventName == "Transfer") {
      const [from, to, amount_low, amount_high] = event.values;
      if (from === caller || to === caller) {
        const amount = uint256.uint256ToBN({
          low: amount_low ?? 0,
          high: amount_high ?? 0,
        });
        erc20Event.balance +=
          from === caller ? -amount : to === caller ? amount : 0n;
      }
    } else if (event.eventName == "Approval") {
      const [owner, spender, amount_low, amount_high] = event.values;
      if (owner === caller) {
        const amount = uint256.uint256ToBN({
          low: amount_low ?? 0,
          high: amount_high ?? 0,
        });
        // approval always have the updated allowance, we must overwrite it
        erc20Event.allowances[getChecksumAddress(spender ?? 0)] = amount;
      }
    }
  }

  //--------------------------
  // ERC721
  //
  const erc721Events: {
    contractAddress: string;
    balance: bigint;
    approved: bigint[]; // tokenIds
    operators: string[]; // accounts with ApprovalForAll
  }[] = [];
  for (const event of events) {
    if (event.contractType !== "ERC721") continue;

    let erc721Event = erc721Events.find(
      (e) => e.contractAddress === event.contractAddress,
    );
    if (!erc721Event) {
      erc721Event = {
        contractAddress: event.contractAddress,
        balance: 0n,
        approved: [],
        operators: [],
      };
      erc721Events.push(erc721Event);
    }

    if (event.eventName == "Transfer") {
      const [from, to, id_low, id_high] = event.values;
      if (from === caller || to === caller) {
        const tokenId = uint256.uint256ToBN({
          low: id_low ?? 0,
          high: id_high ?? 0,
        });
        erc721Event.balance += from === caller ? -1n : to === caller ? 1n : 0n;
        // reset approval, if any
        erc721Event.approved = erc721Event.approved.filter(
          (t) => t !== tokenId,
        );
      }
    } else if (event.eventName == "Approval") {
      const [owner, approved, id_low, id_high] = event.values;
      if (owner === caller && approved !== undefined) {
        const tokenId = uint256.uint256ToBN({
          low: id_low ?? 0,
          high: id_high ?? 0,
        });
        if (!erc721Event.approved.includes(tokenId)) {
          erc721Event.approved.push(tokenId);
        }
      }
    } else if (event.eventName == "ApprovalForAll") {
      const [owner, operator, approved] = event.values;
      if (
        owner === caller &&
        operator !== undefined &&
        approved !== undefined
      ) {
        const op = getChecksumAddress(operator);
        if (!approved) {
          erc721Event.operators = erc721Event.operators.filter((o) => o !== op);
        } else if (!erc721Event.operators.includes(op)) {
          erc721Event.operators.push(op);
        }
      }
    }
  }

  //--------------------------
  // ERC1155
  //
  const erc1155Events: {
    contractAddress: string;
    balance: bigint;
    approved: bigint[]; // tokenIds
    operators: string[]; // accounts with ApprovalForAll
  }[] = [];
  for (const event of events) {
    if (event.contractType !== "ERC1155") continue;

    let erc1155Event = erc1155Events.find(
      (e) => e.contractAddress === event.contractAddress,
    );
    if (!erc1155Event) {
      erc1155Event = {
        contractAddress: event.contractAddress,
        balance: 0n,
        approved: [],
        operators: [],
      };
      erc1155Events.push(erc1155Event);
    }

    if (event.eventName == "TransferSingle") {
      const [, from, to, id_low, id_high, value_low, value_high] = event.values;
      if (from === caller || to === caller) {
        const id = uint256.uint256ToBN({
          low: id_low ?? 0,
          high: id_high ?? 0,
        });
        const value = uint256.uint256ToBN({
          low: value_low ?? 0,
          high: value_high ?? 0,
        });
        erc1155Event.balance += from === caller ? -value : value;
        if (from === caller) {
          let count = value;
          erc1155Event.approved = erc1155Event.approved.filter((t) => {
            if (count > 0n && t === id) {
              count--;
              return false;
            }
            return true;
          });
        } else {
          for (let i = 0n; i < value; i++) {
            erc1155Event.approved.push(id);
          }
        }
      }
    } else if (event.eventName == "TransferBatch") {
      // values: [operator, from, to, ids_len, id0_low, id0_high, ..., values_len, val0_low, val0_high, ...]
      // ids and values are u256 (2 felts each)
      const [, from, to, idsLen, ...rest] = event.values;
      if (idsLen !== undefined && (from === caller || to === caller)) {
        const n = Number(idsLen);
        const ids: bigint[] = [];
        for (let i = 0; i < n; i++) {
          ids.push(
            uint256.uint256ToBN({
              low: rest[i * 2] ?? 0n,
              high: rest[i * 2 + 1] ?? 0n,
            }),
          );
        }
        const valuesOffset = n * 2; // index of values_len
        const valuesLen = Number(rest[valuesOffset] ?? 0n);
        const amounts: bigint[] = [];
        for (let i = 0; i < valuesLen; i++) {
          amounts.push(
            uint256.uint256ToBN({
              low: rest[valuesOffset + 1 + i * 2] ?? 0n,
              high: rest[valuesOffset + 2 + i * 2] ?? 0n,
            }),
          );
        }
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i]!;
          const amount = amounts[i] ?? 0n;
          erc1155Event.balance += from === caller ? -amount : amount;
          if (from === caller) {
            let count = amount;
            erc1155Event.approved = erc1155Event.approved.filter((t) => {
              if (count > 0n && t === id) {
                count--;
                return false;
              }
              return true;
            });
          } else {
            for (let j = 0n; j < amount; j++) {
              erc1155Event.approved.push(id);
            }
          }
        }
      }
    } else if (event.eventName == "ApprovalForAll") {
      // values: [owner, operator, approved]
      const [owner, operator, approved] = event.values;
      if (
        owner === caller &&
        operator !== undefined &&
        approved !== undefined
      ) {
        const op = getChecksumAddress(operator);
        if (!approved) {
          erc1155Event.operators = erc1155Event.operators.filter(
            (o) => o !== op,
          );
        } else if (!erc1155Event.operators.includes(op)) {
          erc1155Event.operators.push(op);
        }
      }
    }
  }

  // consolidate
  const result: SimulationBalance[] = [
    ...erc20Events.map<SimulationBalance>((e) => ({
      contractAddress: e.contractAddress,
      contractType: "ERC20",
      balance: e.balance,
      allowance: Object.values(e.allowances).reduce((acc, v) => acc + v, 0n),
      approvedAll: false,
    })),
    ...erc721Events.map<SimulationBalance>((e) => ({
      contractAddress: e.contractAddress,
      contractType: "ERC721",
      balance: e.balance,
      allowance: BigInt(e.approved.length),
      approvedAll: e.operators.length > 0,
    })),
    ...erc1155Events.map<SimulationBalance>((e) => ({
      contractAddress: e.contractAddress,
      contractType: "ERC1155",
      balance: e.balance,
      allowance: BigInt(e.approved.length),
      approvedAll: e.operators.length > 0,
    })),
    // cleanup used tokens and allowances
  ].filter((r) => r.balance != 0n || r.allowance != 0n || r.approvedAll);

  return result;
};
