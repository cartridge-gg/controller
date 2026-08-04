// Credit unit helpers — the single source of truth for credit ↔ USD display.
//
// Canonical unit (see internal credits-unification plan): $1 = 1e8 raw credit
// units. The raw value lives in `account.credits.amount` (decimals 6), so
// 1 "plain" credit = 1e6 raw units and 100 plain credits = $1.
//
// Product convention: $1 of credits is always $1, so we surface credits as a
// USD-style figure with two decimals (e.g. "12.34") rather than a bare credit
// count. Route all credit display through `formatCredits` so the conversion and
// rounding can never drift.

import { COINBASE_APPLE_PAY_MIN_USD } from "@/hooks/payments/coinbase";

export const CREDIT_UNITS_PER_USD = 100_000_000n; // 1e8 raw units = $1
export const CREDIT_UNITS_PER_CREDIT = 1_000_000n; // 1e6 raw units = 1 plain credit
export const USDC_DECIMALS = 6; // $1 = 1 USDC = 1e6 USDC wei

export interface FormattedCredits {
  /** Dollar value of the credits. */
  usd: number;
  /** Whole "plain" credits (100 = $1). */
  credits: number;
  /** USD-style display string with two decimals, e.g. "1234.56". */
  formatted: string;
}

/** Format a raw credit amount (`account.credits.amount`) for display. */
export function formatCredits(
  rawUnits: bigint | number | string,
  minDecimals: number = 2,
  maxDecimals: number = 4,
): FormattedCredits {
  const units =
    typeof rawUnits === "bigint"
      ? rawUnits
      : BigInt(Math.trunc(Number(rawUnits)));
  const usd = Number(units) / 1e8;
  // const credits = Number(units) / 1e6; // 1 credit = $0.01
  const credits = Number(units) / 1e8; // 1 credit = $1.00
  let formatted = credits.toFixed(maxDecimals);
  while (
    formatted.at(-1) === "0" &&
    formatted.split(".")[1].length > minDecimals
  ) {
    formatted = formatted.slice(0, -1);
  }
  if (formatted.at(-1) === ".") {
    formatted = formatted.slice(0, -1);
  }
  return {
    usd,
    credits,
    formatted,
  };
}

/** USD dollars → raw credit units (1e8 per $1). */
export function usdToCreditUnits(usd: number): bigint {
  return BigInt(Math.round(usd * 1e8));
}

/**
 * USD dollars → whole "plain" credits (100 per $1) for a `CreditsInput.amount`
 * sent with `decimals: 0`. The backend normalizes this to 6-decimal raw units
 * (`amount * 1e6`), so $2 → 200 credits and $25,000 → 2,500,000 — both well
 * within GraphQL's 32-bit `Int`.
 */
export function usdToCredits(usd: number): number {
  return Math.round(usd * 100);
}

/** USD dollars → USDC wei (USDC has 6 decimals; $1 = 1 USDC). */
export function usdToUsdcWei(usd: number): bigint {
  return BigInt(Math.round(usd * 10 ** USDC_DECIMALS));
}

// Product bounds for a credits purchase: $5 min /
// $25,000 max. The min also absorbs Coinbase's own Apple Pay onramp floor so
// every fiat rail can validate against the one constant. The controller (USDC
// deposit) rail isn't bound server-side, but the deposit flow still caps it at
// the same max for sanity.
export const MIN_CREDITS_PURCHASE_USD = Math.max(5, COINBASE_APPLE_PAY_MIN_USD);
export const MAX_CREDITS_PURCHASE_USD = 25_000;
