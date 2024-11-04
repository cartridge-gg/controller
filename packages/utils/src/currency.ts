export function formatBalance(balance: string, fixed?: number): string {
  const formattedBalance = parseFloat(balance);
  if (!fixed) {
    return formattedBalance.toString();
  }

  const _fixed = formattedBalance.toFixed(fixed);

  return formattedBalance < parseFloat(_fixed) ? `~${_fixed}` : _fixed;
}
