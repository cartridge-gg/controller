import {
  ByteArray,
  byteArray,
  getChecksumAddress,
  num,
  Provider,
  shortString,
  uint256,
} from "starknet";

type ERC20Metadata = {
  name: string;
  logoUrl?: string;
  symbol: string;
  decimals: number;
  address: string;
};

export const ETH_CONTRACT_ADDRESS = getChecksumAddress(
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
);
export const STRK_CONTRACT_ADDRESS = getChecksumAddress(
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
);

export class ERC20Contract {
  private address: string;
  private logoUrl?: string;
  private provider: Provider;

  private name?: string;
  private symbol?: string;
  private decimals?: number;

  // TODO: Utilize Contract class with ABI
  // private contract: Contract;

  constructor({
    address,
    provider,
    logoUrl,
  }: {
    address: string;
    logoUrl?: string;
    provider: Provider;
  }) {
    this.address = address;
    this.logoUrl = logoUrl;
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

    return this;
  }

  metadata(): ERC20Metadata {
    if (!this.name || !this.symbol || !this.decimals) {
      throw new Error(
        "Token metadata is missing. Make sure to call `.init()` method",
      );
    }

    return {
      address: this.address,
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      logoUrl: this.logoUrl,
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
