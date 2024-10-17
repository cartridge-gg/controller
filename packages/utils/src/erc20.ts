import { getChecksumAddress, Provider, uint256 } from "starknet";
import { hexToString, Hex } from "viem";

export type ERC20Info = {
  name: string;
  logoUrl?: string;
  symbol: string;
  decimals: bigint;
  address: string;
  balance?: number;
  class: ERC20;
  error?: Error;
};

export type EkuboTokenInfo = {
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

  private name: string = "";
  private symbol: string = "";
  private decimals: bigint = 0n;

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

  async info(): Promise<ERC20Info> {
    const [name, symbol, decimals] = await Promise.all([
      this.callName(),
      this.callSymbol(),
      this.callDecimals(),
    ]);
    if (!this.logoUrl) {
      this.logoUrl = await this.fetchLogoUrl();
    }
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;

    return {
      address: this.address,
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      logoUrl: this.logoUrl,
      class: this as ERC20,
      error: undefined,
    };
  }

  async balanceOf(address: string) {
    const balance = await this.provider.callContract({
      contractAddress: this.address,
      entrypoint: "balanceOf",
      calldata: [address],
    });

    const rawBalance = uint256.uint256ToBN({
      low: balance[0],
      high: balance[1],
    });
    return Number(rawBalance) / Number(10n ** this.decimals);
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

      return BigInt(decimals[0]);
    } catch {
      throw new Error(`Failed to fetch decimals for token: ${this.address}`);
    }
  }

  private async fetchLogoUrl() {
    const res = await fetch("https://mainnet-api.ekubo.org/tokens");
    const data: EkuboTokenInfo[] = await res.json();

    return data.find(
      (t) =>
        getChecksumAddress(t.l2_token_address) ===
        getChecksumAddress(this.address),
    )?.logo_url;
  }
}
