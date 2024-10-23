export function formatBalance(balance: bigint): string {
  const formattedBalance = parseFloat(balance.toString());
  if (formattedBalance === 0) {
    return "0.00";
  }

  return formattedBalance < 0.01
    ? `~${formattedBalance.toFixed(2)}`
    : formattedBalance.toFixed(2);
}
