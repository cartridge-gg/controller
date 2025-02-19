import {
  PropsWithChildren,
  createContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ERC20Contract } from "@cartridge/utils";
import {
  Price,
  usePriceByAddressesQuery,
} from "@cartridge/utils/api/cartridge";
import { useQuery } from "react-query";
import { getChecksumAddress, Provider } from "starknet";

const DEFAULT_TOKENS = [
  {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
  },
  {
    address:
      "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
    name: "Starknet Token",
    symbol: "STRK",
    decimals: 18,
    icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
  },
];

const DEFAULT_FEE_TOKEN =
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

export type ERC20Metadata = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
};

export type ERC20 = {
  name: string;
  icon?: string;
  symbol: string;
  decimals: number;
  address: string;
  balance?: bigint;
  price?: Price;
  contract: ERC20Contract;
};

export interface TokensContextValue {
  tokens: Record<string, ERC20>;
  feeToken?: ERC20;
  isLoading: boolean;
  error?: Error;
  register: (address: string) => void;
}

export const TokensContext = createContext<TokensContextValue>({
  tokens: {},
  isLoading: false,
  register: () => { },
});

interface TokensProviderProps extends PropsWithChildren {
  tokens?: ERC20Metadata[];
  refetchInterval?: number;
  feeToken?: string;
  provider?: Provider;
  address?: string;
}

export function TokensProvider({
  children,
  tokens: tokensArg = DEFAULT_TOKENS,
  feeToken = DEFAULT_FEE_TOKEN,
  refetchInterval = 30000,
  provider,
  address,
}: TokensProviderProps) {
  const [tokens, setTokens] = useState<Record<string, ERC20>>({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!provider || !address) {
      return;
    }

    // Create synchronous token initialization
    const tokens = [...DEFAULT_TOKENS];
    if (tokensArg) {
      tokens.push(...tokensArg);
    }

    const initialTokens = tokens.reduce(
      (acc, token) => {
        const { icon, address, name, symbol, decimals } = token;
        const normalizedAddress = getChecksumAddress(address);
        const contract = new ERC20Contract({
          address: normalizedAddress,
          provider,
        });

        acc[normalizedAddress] = {
          name,
          symbol,
          decimals,
          address: normalizedAddress,
          icon,
          contract,
        };
        return acc;
      },
      {} as Record<string, ERC20>,
    );

    setTokens(initialTokens);

    // Then update balances asynchronously
    Object.keys(initialTokens).forEach(async (address) => {
      try {
        const balance = await initialTokens[address].contract.balanceOf(
          address,
        );

        setTokens((prev) => ({
          ...prev,
          [address]: {
            ...prev[address],
            balance,
          },
        }));
      } catch (error) {
        console.error("Error getting balance for:", address, error);
      }
    });
  }, [address, tokensArg, provider]);

  const { error: balanceError, isLoading: isLoadingBalances } = useQuery(
    ["token-balances", address, Object.keys(tokens)],
    async () => {
      if (!address) return;

      const updatedTokens = { ...tokens };
      await Promise.all(
        Object.values(updatedTokens).map(async (token) => {
          const balance = await token.contract.balanceOf(address);
          updatedTokens[token.address] = {
            ...token,
            balance,
          };
        }),
      );

      setTokens(updatedTokens);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    },
    {
      enabled: !!address && Object.keys(tokens).length > 0,
      refetchInterval,
      retry: false,
    },
  );
  const addresses = useMemo(() => Object.keys(tokens), [tokens]);

  const {
    data: priceData,
    isLoading: isPriceLoading,
    error: priceError,
  } = usePriceByAddressesQuery(
    {
      addresses,
    },
    {
      refetchInterval,
      enabled: addresses.length > 0,
    },
  );

  useEffect(() => {
    if (priceData?.priceByAddresses) {
      setTokens((prevTokens) => {
        const newTokens = { ...prevTokens };
        priceData.priceByAddresses.forEach((price, index) => {
          const address = addresses[index];
          if (newTokens[address]) {
            newTokens[address].price = price;
          }
        });
        return newTokens;
      });
    }
  }, [priceData?.priceByAddresses, addresses]);

  const register = useCallback(
    async (address: string) => {
      if (!provider) return;

      const normalizedAddress = getChecksumAddress(address);
      if (tokens[normalizedAddress]) return;

      const newTokens = { ...tokens };
      const contract = new ERC20Contract({
        address: normalizedAddress,
        provider,
      });

      try {
        const balance = await contract.balanceOf(address);
        await contract.init();
        const metadata = contract.metadata();

        newTokens[normalizedAddress] = {
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          address: normalizedAddress,
          icon: "",
          contract,
          balance,
        };

        setTokens(newTokens);
      } catch (error) {
        console.error(`Failed to load token ${normalizedAddress}:`, error);
      }
    },
    [address, tokens, provider],
  );

  const value = useMemo(
    () => ({
      tokens,
      feeToken: tokens[getChecksumAddress(feeToken)],
      isLoading: !initialLoadComplete && (isLoadingBalances || isPriceLoading),
      error: (balanceError || priceError) as Error | undefined,
      register,
    }),
    [
      tokens,
      feeToken,
      initialLoadComplete,
      isLoadingBalances,
      isPriceLoading,
      balanceError,
      priceError,
      register,
    ],
  );

  return (
    <TokensContext.Provider value={value}>{children}</TokensContext.Provider>
  );
}
