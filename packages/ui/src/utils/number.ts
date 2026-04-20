export const formatNumber = (num: number | string | bigint): string => {
  // Handle BigInt by converting to number
  let numericValue: number;
  if (typeof num === "bigint") {
    numericValue = Number(num);
  } else if (typeof num === "string") {
    numericValue = parseFloat(num);
  } else {
    numericValue = num;
  }

  if (isNaN(numericValue)) {
    return "0";
  }

  // Use the browser's locale for regional number formatting
  return numericValue.toLocaleString(navigator.language);
};
