import { ERC20 } from "../../context/tokens";
import { ERC20Contract } from "../../erc20";

export const tokensBySymbol: Record<string, ERC20> = {
  ETH: {
    address:
      "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
    balance: 1000000000000000000n,
    price: {
      amount: "1000000000000000000",
      base: "USD",
      decimals: 18,
      quote: "USD",
    },
    contract: {} as ERC20Contract,
  },
  STRK: {
    address:
      "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
    name: "Stark",
    symbol: "STRK",
    decimals: 18,
    icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
    balance: 1000000000000000000n,
    price: {
      amount: "1000000000000000000",
      base: "USD",
      decimals: 18,
      quote: "USD",
    },
    contract: {} as ERC20Contract,
  },
};

export const tokensByAddress: Record<string, ERC20> = Object.values(
  tokensBySymbol,
).reduce((acc, t) => ({ ...acc, [t.address]: t }), {});
