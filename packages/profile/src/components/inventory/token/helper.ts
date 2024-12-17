export const formatBalance = (balance: string) => {
  // Catch prefix until number
  let prefix = "";
  for (const char of balance) {
    if (!isNaN(parseInt(char))) {
      break;
    }
    prefix += char;
  }
  return `${prefix}${parseFloat(balance.replace(prefix, "")).toLocaleString()}`;
};
