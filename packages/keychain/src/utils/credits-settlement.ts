export class CreditsBalancePendingError extends Error {
  constructor(
    public readonly requiredCredits: bigint,
    public readonly observedCredits: bigint,
  ) {
    super(
      "Your credits were added, but the updated balance is still syncing. The bundle was not purchased yet.",
    );
    this.name = "CreditsBalancePendingError";
  }
}

/**
 * Wait for a newly-settled credit deposit to become visible to the authoritative
 * balance query. Coinflow settlement and the account query can converge a few
 * seconds apart, so a single refetch is not sufficient for an automatic debit.
 */
export async function waitForCreditsBalance({
  requiredCredits,
  refetchBalance,
  timeoutMs = 30_000,
  pollIntervalMs = 1_000,
}: {
  requiredCredits: bigint;
  refetchBalance: () => Promise<bigint>;
  timeoutMs?: number;
  pollIntervalMs?: number;
}): Promise<bigint> {
  const startedAt = Date.now();
  let observedCredits = 0n;

  do {
    observedCredits = await refetchBalance();
    if (observedCredits >= requiredCredits) return observedCredits;

    const remainingMs = timeoutMs - (Date.now() - startedAt);
    if (remainingMs <= 0) break;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(pollIntervalMs, remainingMs)),
    );
  } while (Date.now() - startedAt < timeoutMs);

  throw new CreditsBalancePendingError(requiredCredits, observedCredits);
}
