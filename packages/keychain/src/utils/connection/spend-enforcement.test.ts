import { describe, expect, it, vi, beforeEach } from "vitest";
import { ErrorCode } from "@cartridge/controller-wasm/controller";

// --- mocks -----------------------------------------------------------------

vi.mock("@/utils/graphql", () => ({ fetchData: vi.fn() }));

vi.mock("@/components/simulation/event-parser", () => ({
  parseSimulationEvents: vi.fn(),
}));

vi.mock("starknet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("starknet")>();
  return {
    ...actual,
    Account: class {
      simulateTransaction = vi.fn().mockResolvedValue([]);
    },
  };
});

import { fetchData } from "@/utils/graphql";
import { parseSimulationEvents } from "@/components/simulation/event-parser";
import { getChecksumAddress, uint256 } from "starknet";
import type { SimulationEvent } from "@/components/simulation/event-parser";
import { executeWithSpendEnforcement } from "./spend-enforcement";
import type { ControllerError } from "./execute";

const mockFetchData = vi.mocked(fetchData);
const mockParse = vi.mocked(parseSimulationEvents);

const ADDRESS = "0x1234";
// USDC (6 decimals) — present in preset ERC20 metadata.
const USDC =
  "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";
const DYNAMIC_TOKEN =
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";

const mockCallContract = vi.fn();

const controller = {
  provider: { callContract: mockCallContract },
  address: () => ADDRESS,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

function outboundTransfer(
  contractAddress: string,
  amount: bigint,
): SimulationEvent {
  const { low, high } = uint256.bnToUint256(amount);
  return {
    contractAddress,
    contractType: "ERC20",
    entryPointSelector: "0x0",
    keys: [],
    data: [],
    values: [BigInt(ADDRESS), BigInt("0x9999"), BigInt(low), BigInt(high)],
    eventName: "Transfer",
  };
}

function routeFetchData({
  spendingAmountCents,
  spendingUsedCents = 0,
  events = [],
  statusThrows = false,
  priceAddress = USDC,
}: {
  spendingAmountCents: number | null;
  spendingUsedCents?: number;
  events?: SimulationEvent[];
  statusThrows?: boolean;
  priceAddress?: string;
}) {
  mockParse.mockResolvedValue(events);
  mockFetchData.mockImplementation((async (doc: string) => {
    if (doc.includes("priceByAddresses")) {
      // $1.00 per whole token (amount 1e8, decimals 8)
      return {
        priceByAddresses: [
          {
            __typename: "Price",
            base: priceAddress,
            quote: "USD",
            amount: "100000000",
            decimals: 8,
          },
        ],
      };
    }
    if (statusThrows) throw new Error("responsible gaming status unavailable");
    return {
      responsibleGaming: {
        windowStart: "2026-07-22T00:00:00Z",
        spending: {
          amountCents: spendingAmountCents,
          usedCents: spendingUsedCents,
        },
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockCallContract.mockResolvedValue(["0x6"]);
});

describe("executeWithSpendEnforcement", () => {
  it("takes the fast path when there is no active spending limit", async () => {
    routeFetchData({ spendingAmountCents: null });
    const execute = vi.fn().mockResolvedValue({ transaction_hash: "0xabc" });

    const result = await executeWithSpendEnforcement(controller, [], execute);

    expect(result).toEqual({ transaction_hash: "0xabc" });
    expect(execute).toHaveBeenCalledTimes(1);
    // Only the status query — no simulation or server-side spend mutation.
    expect(mockParse).not.toHaveBeenCalled();
    expect(mockFetchData).toHaveBeenCalledTimes(1);
  });

  it("fails closed when responsible-gaming status cannot be fetched", async () => {
    routeFetchData({ spendingAmountCents: null, statusThrows: true });
    const execute = vi.fn().mockResolvedValue({ transaction_hash: "0xabc" });

    await expect(
      executeWithSpendEnforcement(controller, [], execute),
    ).rejects.toMatchObject({ code: ErrorCode.StarknetContractError });
    expect(execute).not.toHaveBeenCalled();
  });

  it("loads decimals on-chain for an unlisted ERC20 token", async () => {
    routeFetchData({
      spendingAmountCents: 100000,
      events: [outboundTransfer(DYNAMIC_TOKEN, 1_000_000n)],
      priceAddress: DYNAMIC_TOKEN,
    });
    const execute = vi.fn().mockResolvedValue({ transaction_hash: "0xabc" });

    await executeWithSpendEnforcement(controller, [], execute);

    expect(mockCallContract).toHaveBeenCalledWith({
      contractAddress: getChecksumAddress(DYNAMIC_TOKEN),
      entrypoint: "decimals",
      calldata: [],
    });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(mockFetchData).toHaveBeenCalledTimes(2);
  });

  it("tracks successful self-custodial spend locally across executions", async () => {
    routeFetchData({
      spendingAmountCents: 150,
      events: [outboundTransfer(USDC, 1_000_000n)], // 1 USDC = $1.00 = 100 cents
    });
    const execute = vi.fn().mockResolvedValue({ transaction_hash: "0xdef" });

    const result = await executeWithSpendEnforcement(controller, [], execute);
    expect(result).toEqual({ transaction_hash: "0xdef" });
    await expect(
      executeWithSpendEnforcement(controller, [], execute),
    ).rejects.toMatchObject({ code: ErrorCode.InsufficientBalance });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("rolls back local usage when execution fails", async () => {
    routeFetchData({
      spendingAmountCents: 100,
      events: [outboundTransfer(USDC, 1_000_000n)],
    });
    const executionError = new Error("execution reverted");
    const execute = vi.fn().mockRejectedValueOnce(executionError);

    await expect(
      executeWithSpendEnforcement(controller, [], execute),
    ).rejects.toBe(executionError);

    execute.mockResolvedValueOnce({ transaction_hash: "0xdef" });
    await expect(
      executeWithSpendEnforcement(controller, [], execute),
    ).resolves.toEqual({ transaction_hash: "0xdef" });
  });

  it("fails closed (blocks) when simulation errors while a limit is active", async () => {
    routeFetchData({ spendingAmountCents: 100000 });
    mockParse.mockRejectedValue(new Error("simulation failed"));
    const execute = vi.fn().mockResolvedValue({ transaction_hash: "0x1" });

    await expect(
      executeWithSpendEnforcement(controller, [], execute),
    ).rejects.toMatchObject({
      code: ErrorCode.StarknetContractError,
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("includes server-recorded credit spend in the client-side check", async () => {
    routeFetchData({
      spendingAmountCents: 150,
      spendingUsedCents: 100,
      events: [outboundTransfer(USDC, 1_000_000n)],
    });
    const execute = vi.fn().mockResolvedValue({ transaction_hash: "0x1" });

    let error: ControllerError | undefined;
    try {
      await executeWithSpendEnforcement(controller, [], execute);
    } catch (e) {
      error = e as ControllerError;
    }

    expect(error?.code).toBe(ErrorCode.InsufficientBalance);
    expect(error?.message.toLowerCase()).toContain("spending limit");
    expect(execute).not.toHaveBeenCalled();
  });
});
