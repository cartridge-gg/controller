import {
  ByteArray,
  byteArray,
  getChecksumAddress,
  num,
  Provider,
  shortString,
  uint256,
} from "starknet";

export type ERC20Metadata = {
  name: string;
  logoUrl?: string;
  symbol: string;
  decimals: number;
  address: string;
  instance: ERC20;
};

export const ETH_CONTRACT_ADDRESS = getChecksumAddress(
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
);
export const STRK_CONTRACT_ADDRESS = getChecksumAddress(
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
);
export const USDC_CONTRACT_ADDRESS = getChecksumAddress(
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
);
export const USDT_CONTRACT_ADDRESS = getChecksumAddress(
  "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
);
export const DAI_CONTRACT_ADDRESS = getChecksumAddress(
  "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
);
export const EKUBO_CONTRACT_ADDRESS = getChecksumAddress(
  "0x075afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87",
);
export const LORDS_CONTRACT_ADDRESS = getChecksumAddress(
  "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
);

export class ERC20 {
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
      instance: this,
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
