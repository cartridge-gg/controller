const formatValue = ({
  value,
  fractionDigits,
  prefix = "",
  suffix = "",
  trim = false,
}: {
  value: number | undefined | null;
  fractionDigits: number;
  prefix?: string;
  suffix?: string;
  trim?: boolean;
}): string => {
  let result: string;

  let isNegative = false;
  let isUnderflow = false;

  if (!value) {
    result = (0).toFixed(fractionDigits);
  } else {
    const minValue = 1 / 10 ** fractionDigits;
    if (value < 0) {
      isNegative = true;
      value = -value;
    }
    if (value < minValue) {
      result = minValue.toFixed(fractionDigits);
      isUnderflow = true;
    } else {
      result = value.toFixed(fractionDigits);
    }
  }

  if (trim) {
    // remove trailing zeroes and decimal separator if no more fraction digits
    result = result.replace(/0+$/, "").replace(/\.$/, "");
  }

  return `${isUnderflow ? "<" : ""}${isNegative ? "-" : ""}${prefix}${result}${suffix}`;
};

export const formatUsdValue = (
  value: number | bigint | undefined | null,
): string => {
  return formatValue({
    value: typeof value === "bigint" ? Number(value) : value,
    fractionDigits: 2,
    prefix: "$",
    trim: false,
  });
};

export const formatUsdValueDifference = (
  value: number | bigint | undefined | null,
): string => {
  let result = formatUsdValue(Math.abs(Number(value ?? 0)));
  if (result.startsWith("<")) {
    result = result.slice(1);
  }
  return `${Number(value ?? 0) < 0 ? "-" : "+"}${result}`;
};

export const formatTokenValue = (
  value: bigint | number | undefined | null,
  fractionDigits: number,
  symbol?: string,
): string => {
  return formatValue({
    value: typeof value === "bigint" ? Number(value) : value,
    fractionDigits,
    suffix: symbol ? ` ${symbol}` : "",
    trim: true,
  });
};
