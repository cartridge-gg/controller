import { Provider, uint256 } from "starknet";
import { hexToString, Hex } from "viem";

export type ERC20Metadata = {
  name: string;
  logoUrl?: string;
  symbol: string;
  decimals: number;
  address: string;
  instance: ERC20;
};

export type EkuboERC20Metadata = {
  name: string;
  symbol: string;
  decimals: number;
  l2_token_address: string;
  sort_order: string;
  total_supply: number;
  logo_url: string;
};

export const ETH_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_CONTRACT_ADDRESS =
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

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

  async balanceOf(address: string) {
    if (!this.decimals) {
      throw new Error(
        "Token metadata is missing. Make sure to call `.init()` method",
      );
    }

    const balance = await this.provider.callContract({
      contractAddress: this.address,
      entrypoint: "balanceOf",
      calldata: [address],
    });

    const rawBalance = uint256.uint256ToBN({
      low: balance[0],
      high: balance[1],
    });
    return Number(rawBalance) / Number(10 ** this.decimals);
  }

  private async callName() {
    try {
      const name = (await this.provider.callContract({
        contractAddress: this.address,
        entrypoint: "name",
      })) as Hex[];

      return hexToString(name[0]);
    } catch {
      throw new Error(`Failed to fetch name for token: ${this.address}`);
    }
  }

  private async callSymbol() {
    try {
      const symbol = (await this.provider.callContract({
        contractAddress: this.address,
        entrypoint: "symbol",
      })) as Hex[];

      return hexToString(symbol[0]);
    } catch {
      throw new Error(`Failed to fetch symbol for token: ${this.address}`);
    }
  }

  private async callDecimals() {
    try {
      const decimals = (await this.provider.callContract({
        contractAddress: this.address,
        entrypoint: "decimals",
      })) as Hex[];

      return Number(decimals[0]);
    } catch {
      throw new Error(`Failed to fetch decimals for token: ${this.address}`);
    }
  }

  static async fetchAllMetadata(): Promise<Omit<ERC20Metadata, "instance">[]> {
    const res = await fetch("https://mainnet-api.ekubo.org/tokens");
    const data = (await res.json()) as EkuboERC20Metadata[];

    return data.map((d) => ({
      name: d.name,
      logoUrl: d.logo_url,
      symbol: d.symbol,
      decimals: d.decimals,
      address: d.l2_token_address,
    }));
  }
}
