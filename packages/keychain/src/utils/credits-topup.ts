export type CreditsBackedPaymentMethod =
  | "coinflow"
  | "credits"
  | "apple-pay"
  | "onchain";

/** Card purchases always deposit credits; credits purchases only top up a shortfall. */
export function shouldOpenCreditsDeposit(
  method: CreditsBackedPaymentMethod,
  hasSufficientCredits: boolean,
): boolean {
  return (
    method === "coinflow" || (method === "credits" && !hasSufficientCredits)
  );
}

/** Calculate the USD deposit needed to cover a raw credit-unit shortfall. */
export function creditsTopupAmountUsd({
  requiredCredits,
  creditsBalance,
  minimumAmount,
}: {
  requiredCredits: bigint;
  creditsBalance: bigint;
  minimumAmount: number;
}): number {
  const shortfall =
    requiredCredits > creditsBalance ? requiredCredits - creditsBalance : 0n;
  // Round upward to a cent so the deposit cannot land below the quote.
  const shortfallUsd = Number((shortfall + 999_999n) / 1_000_000n) / 100;
  return Math.max(minimumAmount, shortfallUsd);
}
