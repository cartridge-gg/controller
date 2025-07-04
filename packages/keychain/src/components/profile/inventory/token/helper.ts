export const formatBalance = (balance: string, exludes?: string[]) => {
  // Catch prefix until number
  const prefix = balance.slice(0, balance.search(/\d/));
  // Exclude each substring from prefix
  const cleaned =
    exludes?.reduce((prev, curr) => prev.replace(curr, ""), prefix) ?? prefix;
  return `${cleaned}${parseFloat(balance.replace(prefix, "")).toLocaleString(
    undefined,
    { maximumFractionDigits: 18 },
  )}`;
};
