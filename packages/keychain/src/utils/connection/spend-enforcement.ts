import { Account, type Call, type InvokeFunctionResponse } from "starknet";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import { erc20Metadata } from "@cartridge/presets";
import {
  PriceByAddressesDocument,
  type PriceByAddressesQuery,
  type PriceByAddressesQueryVariables,
} from "@cartridge/controller-ui/utils/api/cartridge";
import type Controller from "@/utils/controller";
import { fetchData } from "@/utils/graphql";
import {
  PlayerControlsDocument,
  type PlayerControlsQuery,
  type PlayerControlsQueryVariables,
} from "@/utils/api";
import { parseSimulationEvents } from "@/components/simulation/event-parser";
import {
  computeGrossOutflowCents,
  extractGrossOutflow,
  type TokenGrossOutflow,
  type TokenPrice,
} from "@/utils/gross-outflow";
import { mapPlayerControlsError } from "@/utils/player-controls";
import type { ControllerError } from "./execute";

/**
 * Centralised gross-outflow spend enforcement, shared by session execution
 * (`executeCore`) and manual `account.execute` (ConfirmTransaction).
 *
 * Flow:
 *   1. Query player-controls status. If there is no active entry-and-purchase
 *      limit, run `execute` directly with no simulation or reservation. This is
 *      the common fast path. A status-query failure blocks execution.
 *   2. With an active entry-and-purchase limit: simulate the calls, compute
 *      gross USD outflow, and **fail closed** if simulation or valuation errors.
 *   3. Compare the outflow against server-recorded credit spend plus this
 *      browser's self-custodial usage for the current limit window.
 *   4. Optimistically record the local usage before execution and roll it back
 *      if execution fails or returns no transaction hash.
 */
export async function executeWithSpendEnforcement(
  controller: Controller,
  calls: Call[],
  execute: () => Promise<InvokeFunctionResponse>,
): Promise<InvokeFunctionResponse> {
  let limit: EntryPurchaseLimit | null;
  try {
    limit = await loadEntryPurchaseLimit();
  } catch (cause) {
    throw valuationBlockedError(cause);
  }
  if (!limit) {
    return await execute();
  }

  // Active limit → determine the gross USD-cent outflow. Fail closed.
  let cents: number;
  try {
    const outflows = await simulateGrossOutflow(controller, calls);
    cents = await valuateGrossOutflowCents(controller, outflows);
  } catch (cause) {
    throw valuationBlockedError(cause);
  }

  // No measurable outflow (e.g. calls move no ERC20 value): nothing to reserve.
  if (cents <= 0) {
    return await execute();
  }

  const rollback = reserveClientSpend(controller.address(), limit, cents);

  let result: InvokeFunctionResponse;
  try {
    result = await execute();
  } catch (executionError) {
    rollback();
    throw executionError;
  }

  if (!result?.transaction_hash) {
    rollback();
  }

  return result;
}

/**
 * Whether the user currently has an active entry-and-purchase limit. Query
 * failures are propagated so callers fail closed rather than bypassing a
 * configured limit.
 */
type EntryPurchaseLimit = {
  amountCents: number;
  serverUsedCents: number;
  windowStart: string;
};

async function loadEntryPurchaseLimit(): Promise<EntryPurchaseLimit | null> {
  const data = await fetchData<
    PlayerControlsQuery,
    PlayerControlsQueryVariables
  >(PlayerControlsDocument);
  const { entryPurchase, windowStart } = data.playerControls;
  if (
    entryPurchase.amountCents === null ||
    entryPurchase.amountCents === undefined
  ) {
    return null;
  }
  return {
    amountCents: entryPurchase.amountCents,
    serverUsedCents: entryPurchase.usedCents,
    windowStart: String(windowStart),
  };
}

/** Simulate the calls and reduce them to per-token gross outflow. */
async function simulateGrossOutflow(
  controller: Controller,
  calls: Call[],
): Promise<TokenGrossOutflow[]> {
  const provider = controller.provider;
  const address = controller.address();
  const account = new Account({ provider, address, signer: "0x0" });
  const results = await account.simulateTransaction(
    [{ type: "INVOKE", payload: calls }],
    { skipValidate: true, tip: 0 },
  );
  const events = await parseSimulationEvents(
    results,
    provider as never,
    BigInt(address),
  );
  return extractGrossOutflow(events, BigInt(address));
}

/**
 * Value gross outflow in USD cents, sourcing token decimals from preset ERC20
 * metadata and prices from the pricing API. Missing decimals or price throws
 * (fail closed) via `computeGrossOutflowCents`.
 */
async function valuateGrossOutflowCents(
  controller: Controller,
  outflows: TokenGrossOutflow[],
): Promise<number> {
  if (outflows.length === 0) return 0;

  const addresses = outflows.map((o) => o.contractAddress);
  const priceData = await fetchData<
    PriceByAddressesQuery,
    PriceByAddressesQueryVariables
  >(PriceByAddressesDocument, { addresses });
  const prices = priceData?.priceByAddresses ?? [];

  const decimals = new Map<string, number>();
  await Promise.all(
    outflows.map(async ({ contractAddress }) => {
      decimals.set(
        contractAddress,
        await resolveDecimals(controller, contractAddress),
      );
    }),
  );

  return computeGrossOutflowCents(outflows, (contractAddress) => ({
    decimals: decimals.get(contractAddress),
    price: resolvePrice(prices, contractAddress),
  }));
}

async function resolveDecimals(
  controller: Controller,
  contractAddress: string,
): Promise<number> {
  const metadata = erc20Metadata.find(
    (m) => BigInt(m.l2_token_address) === BigInt(contractAddress),
  );
  if (metadata) return metadata.decimals;

  const result = await controller.provider.callContract({
    contractAddress,
    entrypoint: "decimals",
    calldata: [],
  });
  const value = Number(BigInt(result[0] ?? "-1"));
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new Error(`invalid token decimals for ${contractAddress}`);
  }
  return value;
}

function resolvePrice(
  prices: PriceByAddressesQuery["priceByAddresses"],
  contractAddress: string,
): TokenPrice | undefined {
  const price = prices.find((p) => BigInt(p.base) === BigInt(contractAddress));
  if (!price) return undefined;
  return { amount: BigInt(price.amount), decimals: price.decimals };
}

type ClientSpendUsage = {
  entries: Array<{ createdAt: string; amountCents: number }>;
};

const clientSpendMemory = new Map<string, ClientSpendUsage>();
const clientSpendKeyPrefix = "player-controls:self-custodial-spend:";

function reserveClientSpend(
  address: string,
  limit: EntryPurchaseLimit,
  amountCents: number,
): () => void {
  const key = `${clientSpendKeyPrefix}${address.toLowerCase()}`;
  const previous = readClientSpend(key, limit.windowStart);
  const locallyUsedCents = previous.entries.reduce(
    (total, entry) => total + entry.amountCents,
    0,
  );
  if (
    limit.serverUsedCents + locallyUsedCents + amountCents >
    limit.amountCents
  ) {
    throw limitExceededError();
  }

  writeClientSpend(key, {
    entries: [
      ...previous.entries,
      { createdAt: new Date().toISOString(), amountCents },
    ],
  });
  return () => writeClientSpend(key, previous);
}

function readClientSpend(key: string, windowStart: string): ClientSpendUsage {
  let stored: ClientSpendUsage | undefined;
  try {
    if (globalThis.localStorage) {
      const raw = globalThis.localStorage.getItem(key);
      stored = raw ? (JSON.parse(raw) as ClientSpendUsage) : undefined;
    } else {
      stored = clientSpendMemory.get(key);
    }
  } catch {
    stored = clientSpendMemory.get(key);
  }

  const cutoff = Date.parse(windowStart);
  const entries = Array.isArray(stored?.entries)
    ? stored.entries.filter(
        (entry) =>
          Number.isFinite(entry.amountCents) &&
          entry.amountCents > 0 &&
          Date.parse(entry.createdAt) >= cutoff,
      )
    : [];
  return { entries };
}

function writeClientSpend(key: string, usage: ClientSpendUsage): void {
  clientSpendMemory.set(key, usage);
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(usage));
  } catch {
    // Memory storage remains authoritative for this page lifecycle.
  }
}

/**
 * A rejected reservation means the transaction would exceed the entry-and-
 * purchase limit. Reuse the existing player-controls user message and map to
 * the closest existing controller error code.
 */
function limitExceededError(): ControllerError {
  const cause = new Error("entry purchase limit exceeded");
  return {
    code: ErrorCode.InsufficientBalance,
    message: mapPlayerControlsError(cause),
    data: cause,
  };
}

/**
 * Simulation or valuation failed while an entry-and-purchase limit is active.
 * We fail closed: the transaction is blocked because its spend can't be
 * verified.
 */
function valuationBlockedError(cause: unknown): ControllerError {
  return {
    code: ErrorCode.StarknetContractError,
    message:
      "Couldn't verify this transaction against your entry and purchase limit. Please try again.",
    data: cause,
  };
}
