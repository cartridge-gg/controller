const STRIPE_FIXED_FEE_CENTS = 30;

export const getStripeFeeInCents = (baseCostInCents: number): number => {
  const percentFeeInCents = Math.round(baseCostInCents * 0.039);
  return percentFeeInCents + STRIPE_FIXED_FEE_CENTS;
};
