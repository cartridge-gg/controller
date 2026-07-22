import { getChecksumAddress, uint256 } from "starknet";
import type { SimulationEvent } from "@/components/simulation/event-parser";

/**
 * Gross outflow of a single ERC20 token over a simulated transaction, expressed
 * in the token's base units.
 */
export interface TokenGrossOutflow {
  /** Checksummed ERC20 contract address. */
  contractAddress: string;
  /** Sum of outbound transfer amounts, in token base units. */
  amount: bigint;
}

/**
 * Extract **gross** outflow from parsed simulation events.
 *
 * Gross outflow is defined as every simulated ERC20 `Transfer` event whose
 * `from` address equals the Controller, summed per token. This deliberately:
 *   - does NOT net inbound transfers (a token received in the same tx does not
 *     reduce the outflow figure),
 *   - ignores `Approval` events (allowance grants are not spends),
 *   - ignores non-ERC20 transfers (ERC721/ERC1155 NFTs),
 *   - ignores gas (paid via the fee market, not surfaced as a Transfer event).
 *
 * Callers must pass events already annotated with `contractType`/`eventName`
 * (i.e. the output of `parseSimulationEvents`).
 */
export function extractGrossOutflow(
  events: SimulationEvent[],
  caller: bigint,
): TokenGrossOutflow[] {
  const totals = new Map<string, bigint>();

  for (const event of events) {
    if (event.contractType !== "ERC20") continue;
    if (event.eventName !== "Transfer") continue;

    // ERC20 Transfer: [from, to, amount_low, amount_high]
    const [from, , amountLow, amountHigh] = event.values;
    // Outbound only. Inbound (to === caller) is intentionally NOT netted.
    if (from !== caller) continue;

    const amount = uint256.uint256ToBN({
      low: amountLow ?? 0n,
      high: amountHigh ?? 0n,
    });
    if (amount === 0n) continue;

    const key = getChecksumAddress(event.contractAddress);
    totals.set(key, (totals.get(key) ?? 0n) + amount);
  }

  return [...totals.entries()].map(([contractAddress, amount]) => ({
    contractAddress,
    amount,
  }));
}

/**
 * Fixed-point price of one whole token in USD, as returned by the pricing API:
 * the USD value is `amount / 10^decimals`.
 */
export interface TokenPrice {
  amount: bigint;
  decimals: number;
}

/** Valuation source for a single token — its decimals and USD price. */
export interface TokenValuationSource {
  decimals: number | null | undefined;
  price: TokenPrice | null | undefined;
}

/**
 * Thrown when a token cannot be valued because its decimals or price are
 * missing. Enforcement treats this as a fail-closed condition.
 */
export class SpendValuationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpendValuationError";
  }
}

/** ceil(numerator / denominator) for non-negative bigints. */
function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator;
}

const MAX_GRAPHQL_INT = 2_147_483_647n;

/**
 * Value a single token's gross outflow in USD cents, rounding **up** to the
 * nearest cent:
 *
 *   cents = ceil( amount * priceAmount * 100
 *                 / (10^tokenDecimals * 10^priceDecimals) )
 *
 * Uses exact bigint fixed-point arithmetic (no floating point). Missing token
 * decimals or price is an explicit error — never silently valued at zero.
 */
export function valuateOutflowCents(
  amount: bigint,
  tokenDecimals: number | null | undefined,
  price: TokenPrice | null | undefined,
): number {
  if (tokenDecimals === null || tokenDecimals === undefined) {
    throw new SpendValuationError("missing token decimals for spend valuation");
  }
  if (
    !price ||
    price.amount === null ||
    price.amount === undefined ||
    price.decimals === null ||
    price.decimals === undefined
  ) {
    throw new SpendValuationError("missing token price for spend valuation");
  }
  if (amount <= 0n) return 0;

  const numerator = amount * BigInt(price.amount) * 100n;
  const denominator =
    10n ** BigInt(tokenDecimals) * 10n ** BigInt(price.decimals);

  const cents = ceilDiv(numerator, denominator);
  if (cents > MAX_GRAPHQL_INT) {
    throw new SpendValuationError(
      "gross outflow exceeds the supported spending amount",
    );
  }
  return Number(cents);
}

/**
 * Total USD-cent value of a multi-token gross outflow. Each token is valued and
 * rounded up to cents independently, then summed (so per-token ceiling is
 * preserved rather than rounding the aggregate). Throws `SpendValuationError`
 * via {@link valuateOutflowCents} if any token cannot be valued.
 */
export function computeGrossOutflowCents(
  outflows: TokenGrossOutflow[],
  resolve: (contractAddress: string) => TokenValuationSource,
): number {
  let total = 0;
  for (const outflow of outflows) {
    const { decimals, price } = resolve(outflow.contractAddress);
    const cents = valuateOutflowCents(outflow.amount, decimals, price);
    if (total > Number(MAX_GRAPHQL_INT) - cents) {
      throw new SpendValuationError(
        "gross outflow exceeds the supported spending amount",
      );
    }
    total += cents;
  }
  return total;
}
