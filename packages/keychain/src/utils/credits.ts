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
): FormattedCredits {
  const units =
    typeof rawUnits === "bigint"
      ? rawUnits
      : BigInt(Math.trunc(Number(rawUnits)));
  const usd = Number(units) / 1e8;
  const credits = Number(units) / 1e6;
  return {
    usd,
    credits,
    formatted: credits.toFixed(2),
  };
}

/** USD dollars → raw credit units (1e8 per $1). */
export function usdToCreditUnits(usd: number): bigint {
  return BigInt(Math.round(usd * 1e8));
}

/** USD dollars → USDC wei (USDC has 6 decimals; $1 = 1 USDC). */
export function usdToUsdcWei(usd: number): bigint {
  return BigInt(Math.round(usd * 10 ** USDC_DECIMALS));
}
