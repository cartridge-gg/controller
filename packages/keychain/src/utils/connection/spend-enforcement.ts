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
  ReserveResponsibleGamingSpendDocument,
  type ReserveResponsibleGamingSpendMutation,
  type ReserveResponsibleGamingSpendMutationVariables,
  ReleaseResponsibleGamingSpendDocument,
  type ReleaseResponsibleGamingSpendMutation,
  type ReleaseResponsibleGamingSpendMutationVariables,
  ResponsibleGamingDocument,
  type ResponsibleGamingQuery,
  type ResponsibleGamingQueryVariables,
  SettleResponsibleGamingSpendDocument,
  type SettleResponsibleGamingSpendMutation,
  type SettleResponsibleGamingSpendMutationVariables,
} from "@/utils/api";
import { parseSimulationEvents } from "@/components/simulation/event-parser";
import {
  computeGrossOutflowCents,
  extractGrossOutflow,
  type TokenGrossOutflow,
  type TokenPrice,
} from "@/utils/gross-outflow";
import { mapResponsibleGamingError } from "@/utils/responsible-gaming";
import type { ControllerError } from "./execute";

/**
 * Centralised gross-outflow spend enforcement, shared by session execution
 * (`executeCore`) and manual `account.execute` (ConfirmTransaction).
 *
 * Flow:
 *   1. Query responsible-gaming status. If there is no active spending limit,
 *      run `execute` directly with no simulation or reservation. This is the
 *      common fast path. A status-query failure blocks execution.
 *   2. With an active spending limit: simulate the calls, compute gross USD
 *      outflow, and **fail closed** if simulation or valuation errors.
 *   3. Reserve the computed cents *before* executing. A rejected reservation
 *      (limit exceeded) blocks execution.
 *   4. Settle the reservation once a transaction hash comes back; release it if
 *      execution throws synchronously. Settlement/release failures are logged
 *      and never replace the transaction result or the original execution error.
 */
export async function executeWithSpendEnforcement(
  controller: Controller,
  calls: Call[],
  execute: () => Promise<InvokeFunctionResponse>,
): Promise<InvokeFunctionResponse> {
  let hasLimit: boolean;
  try {
    hasLimit = await hasActiveSpendingLimit();
  } catch (cause) {
    throw valuationBlockedError(cause);
  }
  if (!hasLimit) {
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

  const reference = generateSpendReference();
  try {
    await reserveSpend(reference, cents);
  } catch (cause) {
    throw limitExceededError(cause);
  }

  let result: InvokeFunctionResponse;
  try {
    result = await execute();
  } catch (executionError) {
    // Synchronous execution failure: release the hold, but never let a release
    // error mask the original execution error.
    await releaseSpendQuietly(reference);
    throw executionError;
  }

  if (result?.transaction_hash) {
    // Settlement is best-effort: a failure here must not replace the successful
    // transaction result. The reservation is left in place (conservative).
    await settleSpendQuietly(reference);
  } else {
    // No transaction hash returned and no throw: leave the reservation in place
    // (conservative) rather than releasing against a possibly-live spend.
    console.warn(
      "[spend-enforcement] execute returned no transaction hash; leaving reservation in place",
      reference,
    );
  }

  return result;
}

/**
 * Whether the user currently has an active spending limit. Query failures are
 * propagated so callers fail closed rather than bypassing a configured limit.
 */
async function hasActiveSpendingLimit(): Promise<boolean> {
  const data = await fetchData<
    ResponsibleGamingQuery,
    ResponsibleGamingQueryVariables
  >(ResponsibleGamingDocument);
  const amountCents = data.responsibleGaming.spending.amountCents;
  return amountCents !== null && amountCents !== undefined;
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

async function reserveSpend(
  reference: string,
  amountCents: number,
): Promise<void> {
  await fetchData<
    ReserveResponsibleGamingSpendMutation,
    ReserveResponsibleGamingSpendMutationVariables
  >(ReserveResponsibleGamingSpendDocument, { reference, amountCents });
}

async function settleSpendQuietly(reference: string): Promise<void> {
  try {
    await fetchData<
      SettleResponsibleGamingSpendMutation,
      SettleResponsibleGamingSpendMutationVariables
    >(SettleResponsibleGamingSpendDocument, { reference });
  } catch (error) {
    console.error(
      "[spend-enforcement] failed to settle reservation; leaving it in place",
      reference,
      error,
    );
  }
}

async function releaseSpendQuietly(reference: string): Promise<void> {
  try {
    await fetchData<
      ReleaseResponsibleGamingSpendMutation,
      ReleaseResponsibleGamingSpendMutationVariables
    >(ReleaseResponsibleGamingSpendDocument, { reference });
  } catch (error) {
    console.error(
      "[spend-enforcement] failed to release reservation; leaving it in place",
      reference,
      error,
    );
  }
}

/**
 * Bounded, unique reservation reference. Prefers `crypto.randomUUID`; falls back
 * to a time + counter + random hex string when it's unavailable. Capped at 64
 * characters.
 */
let referenceCounter = 0;
export function generateSpendReference(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return `rg-${crypto.randomUUID()}`;
    }
  } catch {
    // fall through to the manual fallback
  }
  referenceCounter = (referenceCounter + 1) % 0x10000;
  const seq = referenceCounter.toString(16).padStart(4, "0");
  const rand = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
  return `rg-${Date.now().toString(16)}-${seq}-${rand}`.slice(0, 64);
}

/**
 * A rejected reservation means the transaction would exceed the spending limit.
 * Reuse the existing responsible-gaming user message and map to the closest
 * existing controller error code.
 */
function limitExceededError(cause: unknown): ControllerError {
  return {
    code: ErrorCode.InsufficientBalance,
    message: mapResponsibleGamingError(cause),
    data: cause,
  };
}

/**
 * Simulation or valuation failed while a spending limit is active. We fail
 * closed: the transaction is blocked because its spend can't be verified.
 */
function valuationBlockedError(cause: unknown): ControllerError {
  return {
    code: ErrorCode.StarknetContractError,
    message:
      "Couldn't verify this transaction against your spending limit. Please try again.",
    data: cause,
  };
}
