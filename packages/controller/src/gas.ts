export const MIN_SELF_FUNDED_GAS_MULTIPLIER = 1.5;
export const MAX_SELF_FUNDED_GAS_MULTIPLIER = 10;

export function isValidSelfFundedGasMultiplier(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= MIN_SELF_FUNDED_GAS_MULTIPLIER &&
    value <= MAX_SELF_FUNDED_GAS_MULTIPLIER
  );
}

export function validateSelfFundedGasMultiplier(value?: number) {
  if (value !== undefined && !isValidSelfFundedGasMultiplier(value)) {
    throw new RangeError(
      `selfFundedGasMultiplier must be a finite number between ${MIN_SELF_FUNDED_GAS_MULTIPLIER} and ${MAX_SELF_FUNDED_GAS_MULTIPLIER}`,
    );
  }
}
