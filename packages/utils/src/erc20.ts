import {
  ByteArray,
  byteArray,
  getChecksumAddress,
  num,
  Provider,
  shortString,
  uint256,
} from "starknet";
import { erc20Metadata } from "@cartridge/presets";

type ERC20Metadata = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  icon?: string;
};

export const ETH_CONTRACT_ADDRESS = getChecksumAddress(
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
);
export const STRK_CONTRACT_ADDRESS = getChecksumAddress(
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
);

export class ERC20Contract {
  private address: string;
  private provider: Provider;

  private name?: string;
  private symbol?: string;
  private decimals?: number;
  private icon?: string;

  // TODO: Utilize Contract class with ABI
  // private contract: Contract;

  constructor({ address, provider }: { address: string; provider: Provider }) {
    this.address = getChecksumAddress(address);
    this.provider = provider;
  }

  async init() {
    const [name, symbol, decimals] = await Promise.all([
      this.callName(),
      this.callSymbol(),
      this.callDecimals(),
    ]);

    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.icon = erc20Metadata.find(
      (m) => this.address === getChecksumAddress(m.l2_token_address),
    )?.logo_url;

    return this;
  }

  metadata(): ERC20Metadata {
    if (!this.name || !this.symbol || !this.decimals) {
      throw new Error(
        "Token metadata is missing. Make sure to call `.init()` method",
      );
    }

    return {
      address: getChecksumAddress(this.address),
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      icon: this.icon,
    };
  }

  async balanceOf(address: string): Promise<bigint> {
    const balance = await this.provider.callContract({
      contractAddress: this.address,
      entrypoint: "balanceOf",
      calldata: [address],
    });

    const rawBalance = uint256.uint256ToBN({
      low: balance[0],
      high: balance[1],
    });

    return rawBalance;
  }

  private async callName() {
    try {
      const result = await this.provider.callContract({
        contractAddress: this.address,
        entrypoint: "name",
      });

      return this.parseResult(result);
    } catch {
      throw new Error(`Failed to fetch name for token: ${this.address}`);
    }
  }

  private async callSymbol() {
    try {
      const result = await this.provider.callContract({
        contractAddress: this.address,
        entrypoint: "symbol",
      });

      return this.parseResult(result);
    } catch {
      throw new Error(`Failed to fetch symbol for token: ${this.address}`);
    }
  }

  private async callDecimals() {
    try {
      const decimals = await this.provider.callContract({
        contractAddress: this.address,
        entrypoint: "decimals",
      });

      return Number(num.toHex(decimals[0]));
    } catch {
      throw new Error(`Failed to fetch decimals for token: ${this.address}`);
    }
  }

  private parseResult(result: string[]): string {
    if (result.length == 1) {
      return shortString.decodeShortString(result[0]);
    }

    const symbol: ByteArray = {
      data: result[0] != "0x0" ? result.slice(1, -2) : [],
      pending_word: result[result.length - 2],
      pending_word_len: result[result.length - 1],
    };
    return byteArray.stringFromByteArray(symbol);
  }
}

export function formatBalance(
  amount: bigint,
  decimals = 18,
  significantDigits?: number,
) {
  // Convert bigint to decimal string with proper decimal places
  const stringValue = amount.toString();
  const wholePart = stringValue.slice(0, -decimals) || "0";
  const fractionalPart = stringValue.slice(-decimals).padStart(decimals, "0");

  // Parse the number and handle special cases
  const num = parseFloat(`${wholePart}.${fractionalPart}`);

  // If the number is very small (less than 0.01), find first significant digit
  if (wholePart === "0" && num > 0) {
    // Find first non-zero digit
    for (let i = 0; i < fractionalPart.length; i++) {
      if (fractionalPart[i] !== "0") {
        // Return number with either specified significant digits or all digits until last non-zero
        if (significantDigits !== undefined) {
          return num.toFixed(i + significantDigits);
        } else {
          // Find last non-zero digit
          for (let j = fractionalPart.length - 1; j >= i; j--) {
            if (fractionalPart[j] !== "0") {
              return num.toFixed(j + 1);
            }
          }
        }
      }
    }
  }

  // For regular numbers, format with up to 2 decimal places
  const fixed2 = num.toFixed(2);
  if (fixed2.endsWith(".00")) {
    return fixed2.slice(0, -3);
  }

  if (fixed2.endsWith("0")) {
    return fixed2.slice(0, -1);
  }

  return fixed2;
}

export function convertTokenAmountToUSD(
  amount: bigint,
  decimals: number,
  price: { amount: string; decimals: number },
) {
  // Convert price to BigInt
  const priceAmount = BigInt(price.amount);

  // Calculate USD value entirely in BigInt
  // Formula: (amount * priceAmount) / (10 ** decimals)
  const valueInBaseUnits = (amount * priceAmount) / BigInt(10 ** decimals);

  // Convert to decimal for display, handling the price decimals
  const valueInUsd = Number(valueInBaseUnits) / 10 ** price.decimals;

  // Handle zero amount
  if (valueInUsd === 0) {
    return "$0";
  }

  // For small numbers (< 0.01), show 3 decimal places
  if (valueInUsd < 0.01) {
    const formatted = valueInUsd.toFixed(3);
    // If it rounds to 0.000 but is actually non-zero, show <$0.001
    if (formatted === "0.000" && valueInUsd > 0) {
      return "<$0.001";
    }
    return `$${formatted}`;
  }

  // For numbers between 0.01 and 0.1, show 3 decimal places
  if (valueInUsd < 0.1) {
    return `$${valueInUsd.toFixed(3)}`;
  }

  // Format with exactly 2 decimal places for non-whole numbers
  const formatted = valueInUsd.toFixed(2);
  const isWhole = formatted.endsWith(".00");

  // Return whole numbers without decimals, otherwise show exactly 2 decimal places
  return "$" + (isWhole ? Math.floor(valueInUsd).toString() : formatted);
}

export function convertUSDToTokenAmount(
  usdAmount: number,
  decimals: number,
  price: { amount: string; decimals: number },
): bigint {
  // Convert price to BigInt
  const priceAmount = BigInt(price.amount);

  // Convert USD amount to base units (considering price decimals)
  const usdInBaseUnits = BigInt(
    // Use string to maintain precision
    (usdAmount * 10 ** price.decimals).toLocaleString("fullwide", {
      useGrouping: false,
      maximumFractionDigits: 0,
    }),
  );

  // Calculate token amount using BigInt arithmetic
  // Formula: (usdInBaseUnits * (10 ** decimals)) / priceAmount
  const tokenAmount = (usdInBaseUnits * BigInt(10 ** decimals)) / priceAmount;

  return tokenAmount;
}
