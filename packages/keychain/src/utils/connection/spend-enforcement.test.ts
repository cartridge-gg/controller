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

type Order = string[];

function routeFetchData({
  spendingAmountCents,
  events = [],
  reserveThrows = false,
  statusThrows = false,
  priceAddress = USDC,
  order,
  captured,
}: {
  spendingAmountCents: number | null;
  events?: SimulationEvent[];
  reserveThrows?: boolean;
  statusThrows?: boolean;
  priceAddress?: string;
  order?: Order;
  captured?: { reference?: string };
}) {
  mockParse.mockResolvedValue(events);
  mockFetchData.mockImplementation((async (doc: string, vars?: unknown) => {
    if (doc.includes("reserveResponsibleGamingSpend")) {
      order?.push("reserve");
      if (captured)
        captured.reference = (vars as { reference: string }).reference;
      if (reserveThrows) throw new Error("spending limit exceeded");
      return {
        reserveResponsibleGamingSpend: {
          ...(vars as object),
          state: "RESERVED",
        },
      };
    }
    if (doc.includes("settleResponsibleGamingSpend")) {
      order?.push("settle");
      return {
        settleResponsibleGamingSpend: { ...(vars as object), state: "SETTLED" },
      };
    }
    if (doc.includes("releaseResponsibleGamingSpend")) {
      order?.push("release");
      return {
        releaseResponsibleGamingSpend: {
          ...(vars as object),
          state: "RELEASED",
        },
      };
    }
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
        spending: { amountCents: spendingAmountCents },
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCallContract.mockResolvedValue(["0x6"]);
});

describe("executeWithSpendEnforcement", () => {
  it("takes the fast path when there is no active spending limit", async () => {
    routeFetchData({ spendingAmountCents: null });
    const execute = vi.fn().mockResolvedValue({ transaction_hash: "0xabc" });

    const result = await executeWithSpendEnforcement(controller, [], execute);

    expect(result).toEqual({ transaction_hash: "0xabc" });
    expect(execute).toHaveBeenCalledTimes(1);
    // Only the status query — no simulation, no reservation.
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
    const reserveCall = mockFetchData.mock.calls.find((call) =>
      String(call[0]).includes("reserveResponsibleGamingSpend"),
    );
    expect((reserveCall?.[1] as { amountCents: number }).amountCents).toBe(100);
  });

  it("reserves before executing then settles on a returned transaction hash", async () => {
    const order: Order = [];
    const captured: { reference?: string } = {};
    routeFetchData({
      spendingAmountCents: 100000,
      events: [outboundTransfer(USDC, 1_000_000n)], // 1 USDC = $1.00 = 100 cents
      order,
      captured,
    });
    const execute = vi.fn().mockImplementation(async () => {
      order.push("execute");
      return { transaction_hash: "0xdef" };
    });

    const result = await executeWithSpendEnforcement(controller, [], execute);

    expect(result).toEqual({ transaction_hash: "0xdef" });
    expect(order).toEqual(["reserve", "execute", "settle"]);

    // Reserve got the computed cents; settle used the same reference.
    const reserveCall = mockFetchData.mock.calls.find((c) =>
      String(c[0]).includes("reserveResponsibleGamingSpend"),
    );
    expect((reserveCall?.[1] as { amountCents: number }).amountCents).toBe(100);
    expect(captured.reference).toBeTruthy();
    const settleCall = mockFetchData.mock.calls.find((c) =>
      String(c[0]).includes("settleResponsibleGamingSpend"),
    );
    expect((settleCall?.[1] as { reference: string }).reference).toBe(
      captured.reference,
    );
  });

  it("releases the reservation and rethrows when execution fails", async () => {
    const order: Order = [];
    const captured: { reference?: string } = {};
    routeFetchData({
      spendingAmountCents: 100000,
      events: [outboundTransfer(USDC, 1_000_000n)],
      order,
      captured,
    });
    const executionError = new Error("execution reverted");
    const execute = vi.fn().mockImplementation(async () => {
      order.push("execute");
      throw executionError;
    });

    await expect(
      executeWithSpendEnforcement(controller, [], execute),
    ).rejects.toBe(executionError);

    expect(order).toEqual(["reserve", "execute", "release"]);
    const releaseCall = mockFetchData.mock.calls.find((c) =>
      String(c[0]).includes("releaseResponsibleGamingSpend"),
    );
    expect((releaseCall?.[1] as { reference: string }).reference).toBe(
      captured.reference,
    );
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

  it("maps a rejected reservation to a spending-limit controller error", async () => {
    routeFetchData({
      spendingAmountCents: 100000,
      events: [outboundTransfer(USDC, 1_000_000n)],
      reserveThrows: true,
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
