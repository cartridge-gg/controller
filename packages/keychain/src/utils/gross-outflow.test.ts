import { describe, expect, it } from "vitest";
import { uint256 } from "starknet";
import type { SimulationEvent } from "@/components/simulation/event-parser";
import {
  computeGrossOutflowCents,
  extractGrossOutflow,
  SpendValuationError,
  valuateOutflowCents,
  type TokenPrice,
} from "./gross-outflow";

const CALLER = BigInt("0x1234");
const OTHER = BigInt("0x9999");

const TOKEN_A =
  "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";
const TOKEN_B =
  "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac";

function transferEvent(
  contractAddress: string,
  from: bigint,
  to: bigint,
  amount: bigint,
  contractType: SimulationEvent["contractType"] = "ERC20",
): SimulationEvent {
  const { low, high } = uint256.bnToUint256(amount);
  return {
    contractAddress,
    contractType,
    entryPointSelector: "0x0",
    keys: [],
    data: [],
    values: [from, to, BigInt(low), BigInt(high)],
    eventName: "Transfer",
  };
}

function approvalEvent(
  contractAddress: string,
  owner: bigint,
  spender: bigint,
  amount: bigint,
): SimulationEvent {
  const { low, high } = uint256.bnToUint256(amount);
  return {
    contractAddress,
    contractType: "ERC20",
    entryPointSelector: "0x0",
    keys: [],
    data: [],
    values: [owner, spender, BigInt(low), BigInt(high)],
    eventName: "Approval",
  };
}

describe("extractGrossOutflow", () => {
  it("sums outbound transfers gross, without netting inbound of the same token", () => {
    const events = [
      transferEvent(TOKEN_A, CALLER, OTHER, 100n),
      transferEvent(TOKEN_A, OTHER, CALLER, 40n), // inbound — must NOT net
    ];

    const result = extractGrossOutflow(events, CALLER);

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(100n);
  });

  it("ignores approvals", () => {
    const events = [
      approvalEvent(TOKEN_A, CALLER, OTHER, 500n),
      transferEvent(TOKEN_A, CALLER, OTHER, 100n),
    ];

    const result = extractGrossOutflow(events, CALLER);

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(100n);
  });

  it("ignores non-ERC20 (NFT) transfers", () => {
    const events = [
      transferEvent(TOKEN_A, CALLER, OTHER, 1n, "ERC721"),
      transferEvent(TOKEN_B, CALLER, OTHER, 5n, "ERC1155"),
    ];

    expect(extractGrossOutflow(events, CALLER)).toHaveLength(0);
  });

  it("sums per token across multiple tokens", () => {
    const events = [
      transferEvent(TOKEN_A, CALLER, OTHER, 100n),
      transferEvent(TOKEN_A, CALLER, OTHER, 25n),
      transferEvent(TOKEN_B, CALLER, OTHER, 7n),
    ];

    const result = extractGrossOutflow(events, CALLER);
    const byAddress = Object.fromEntries(
      result.map((o) => [BigInt(o.contractAddress).toString(), o.amount]),
    );

    expect(byAddress[BigInt(TOKEN_A).toString()]).toBe(125n);
    expect(byAddress[BigInt(TOKEN_B).toString()]).toBe(7n);
  });

  it("excludes transfers not involving the caller", () => {
    const events = [transferEvent(TOKEN_A, OTHER, OTHER, 100n)];
    expect(extractGrossOutflow(events, CALLER)).toHaveLength(0);
  });
});

describe("valuateOutflowCents", () => {
  // price of 1 USD: amount 1e8, decimals 8
  const oneUsd: TokenPrice = { amount: 100000000n, decimals: 8 };

  it("rounds a sub-cent outflow up to one cent", () => {
    // 1 base unit of a 6-decimals token at $1 = $0.000001 -> ceil to 1 cent
    expect(valuateOutflowCents(1n, 6, oneUsd)).toBe(1);
  });

  it("values whole amounts exactly", () => {
    // 1.5 tokens (6 decimals) at $1 = $1.50 = 150 cents
    expect(valuateOutflowCents(1_500_000n, 6, oneUsd)).toBe(150);
  });

  it("returns 0 for a zero amount", () => {
    expect(valuateOutflowCents(0n, 6, oneUsd)).toBe(0);
  });

  it("throws when token decimals are missing", () => {
    expect(() => valuateOutflowCents(1n, null, oneUsd)).toThrow(
      SpendValuationError,
    );
    expect(() => valuateOutflowCents(1n, undefined, oneUsd)).toThrow(
      SpendValuationError,
    );
  });

  it("throws when the price is missing", () => {
    expect(() => valuateOutflowCents(1n, 6, null)).toThrow(SpendValuationError);
    expect(() => valuateOutflowCents(1n, 6, undefined)).toThrow(
      SpendValuationError,
    );
  });
});

describe("computeGrossOutflowCents", () => {
  const oneUsd: TokenPrice = { amount: 100000000n, decimals: 8 };

  it("sums per-token ceiled cents", () => {
    const outflows = [
      { contractAddress: TOKEN_A, amount: 1n }, // -> ceil 1 cent
      { contractAddress: TOKEN_B, amount: 1_500_000n }, // -> 150 cents
    ];

    const total = computeGrossOutflowCents(outflows, (addr) =>
      addr === TOKEN_A
        ? { decimals: 6, price: oneUsd }
        : { decimals: 6, price: oneUsd },
    );

    expect(total).toBe(151);
  });

  it("propagates a valuation error for a token with no price", () => {
    const outflows = [{ contractAddress: TOKEN_A, amount: 1n }];
    expect(() =>
      computeGrossOutflowCents(outflows, () => ({
        decimals: 6,
        price: undefined,
      })),
    ).toThrow(SpendValuationError);
  });

  it("rejects a multi-token total above the GraphQL Int limit", () => {
    const outflows = [
      { contractAddress: TOKEN_A, amount: 2_147_483_647n },
      { contractAddress: TOKEN_B, amount: 1n },
    ];

    expect(() =>
      computeGrossOutflowCents(outflows, () => ({
        decimals: 0,
        price: { amount: 1n, decimals: 2 },
      })),
    ).toThrow(SpendValuationError);
  });
});
