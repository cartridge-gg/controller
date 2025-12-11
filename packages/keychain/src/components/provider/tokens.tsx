import {
  PropsWithChildren,
  createContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useConnection } from "@/hooks/connection";
import {
  ERC20 as ERC20Contract,
  USDC_CONTRACT_ADDRESS,
} from "@cartridge/ui/utils";
import { Price } from "@cartridge/ui/utils/api/cartridge";
import { useQuery } from "react-query";
import { getChecksumAddress } from "starknet";
import { fetchSwapQuoteInUsdc } from "@/utils/ekubo";

export const DEFAULT_TOKENS = [
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

export const DEFAULT_FEE_TOKEN =
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
  registerPair: (address: string) => void;
}

export const TokensContext = createContext<TokensContextValue>({
  tokens: {},
  isLoading: false,
  registerPair: () => {},
});

interface TokensProviderProps extends PropsWithChildren {
  tokens?: ERC20Metadata[];
  refetchInterval?: number;
  feeToken?: string;
}

export function TokensProvider({
  children,
  tokens: tokensArg = DEFAULT_TOKENS,
  feeToken = DEFAULT_FEE_TOKEN,
  refetchInterval = 30000,
}: TokensProviderProps) {
  const { controller, chainId } = useConnection();
  const [tokens, setTokens] = useState<Record<string, ERC20>>({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isPricesLoaded, setIsPricesLoaded] = useState(false);

  // Memoize addresses to prevent unnecessary re-renders and API calls
  const addresses = useMemo(() => Object.keys(tokens).sort(), [tokens]);

  // Debounced addresses - only updates after 1 second of no changes
  // This prevents excessive API calls when registering multiple tokens rapidly
  const [debouncedAddresses, setDebouncedAddresses] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddresses(addresses);
    }, 100);

    return () => clearTimeout(timer);
  }, [addresses]);

  useEffect(() => {
    if (!controller) {
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
          provider: controller.provider,
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
          controller.address(),
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
  }, [controller, tokensArg]);

  const { error: balanceError, isLoading: isLoadingBalances } = useQuery(
    ["token-balances", controller?.address(), Object.keys(tokens)],
    async () => {
      if (!controller) return;

      // Get fresh token addresses to query
      const tokenAddresses = Object.keys(tokens);

      // Fetch balances for all current tokens
      const balanceUpdates: Record<string, bigint> = {};
      await Promise.all(
        tokenAddresses.map(async (address) => {
          try {
            const token = tokens[address];
            const balance = await token.contract.balanceOf(
              controller.address(),
            );
            balanceUpdates[address] = balance;
          } catch (error) {
            console.error(`Error fetching balance for ${address}:`, error);
          }
        }),
      );

      // Use functional update to merge with latest state
      setTokens((prevTokens) => {
        const updatedTokens = { ...prevTokens };
        Object.entries(balanceUpdates).forEach(([address, balance]) => {
          if (updatedTokens[address]) {
            updatedTokens[address] = {
              ...updatedTokens[address],
              balance,
            };
          }
        });
        return updatedTokens;
      });

      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    },
    {
      enabled: !!controller && Object.keys(tokens).length > 0,
      refetchInterval,
      retry: false,
    },
  );

  // Fetch prices using Ekubo
  const {
    data: priceData,
    isLoading: isPriceLoading,
    error: priceError,
  } = useQuery(
    ["token-prices-ekubo", debouncedAddresses.join(","), chainId],
    async () => {
      if (debouncedAddresses.length === 0 || !chainId) return [];

      const USDC_DECIMALS = 6;
      const ONE_USDC = BigInt(10 ** USDC_DECIMALS); // 1 USDC

      const prices = await Promise.allSettled(
        debouncedAddresses.map(async (address) => {
          try {
            const checksumAddress = getChecksumAddress(address);

            // Get token decimals - tokens should exist by the time price query runs
            const token = tokens[checksumAddress];
            const tokenDecimals = token?.decimals ?? 18; // Default to 18 if not found

            // USDC price is always 1:1
            if (checksumAddress === getChecksumAddress(USDC_CONTRACT_ADDRESS)) {
              return {
                base: address,
                amount: String(ONE_USDC),
                decimals: USDC_DECIMALS,
                quote: "USDC",
              };
            }

            // Fetch quote from Ekubo: how many token base units = 1 USDC
            const tokenAmount = await fetchSwapQuoteInUsdc(
              address,
              BigInt(10 ** (tokenDecimals + 1)),
              chainId,
            );

            return {
              base: address,
              amount: String(tokenAmount / BigInt(10)),
              decimals: USDC_DECIMALS,
              quote: "USDC",
            };
          } catch (error) {
            // Only log non-429 errors (rate limiting is expected)
            const is429 =
              error instanceof Error && error.message.includes("429");
            if (!is429) {
              console.error(`Failed to fetch price for ${address}:`, error);
            }
            return null;
          }
        }),
      );

      return prices
        .filter(
          (result): result is PromiseFulfilledResult<Price | null> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value)
        .filter((price): price is Price => price !== null);
    },
    {
      refetchInterval,
      enabled: debouncedAddresses.length > 0,
      staleTime: 60000, // 1 minute - reduce Ekubo API calls
    },
  );

  useEffect(() => {
    if (priceData) {
      setTokens((prevTokens) => {
        const newTokens = { ...prevTokens };
        priceData.forEach((price) => {
          const address = getChecksumAddress(price.base);
          if (newTokens[address]) {
            newTokens[address] = {
              ...newTokens[address],
              price,
            };
          }
        });
        setIsPricesLoaded(true);
        return newTokens;
      });
    }
  }, [priceData]);

  const registerPair = useCallback(
    async (address: string) => {
      if (!controller) return;

      const normalizedAddress = getChecksumAddress(address);

      const contract = new ERC20Contract({
        address: normalizedAddress,
        provider: controller.provider,
      });

      try {
        const balance = await contract.balanceOf(controller.address());
        await contract.init();
        const metadata = contract.metadata();

        const newToken = {
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          address: normalizedAddress,
          icon: "",
          contract,
          balance,
        };

        setTokens((prevTokens) => {
          // Check if token already exists
          if (prevTokens[normalizedAddress]) {
            return prevTokens;
          }

          return {
            ...prevTokens,
            [normalizedAddress]: newToken,
          };
        });
      } catch {
        // Failed to load token - skip
      }
    },
    [controller],
  );

  const value = useMemo(
    () => ({
      tokens,
      feeToken: tokens[getChecksumAddress(feeToken)],
      isLoading:
        !initialLoadComplete &&
        (isLoadingBalances || isPriceLoading || isPricesLoaded),
      error: (balanceError || priceError) as Error | undefined,
      registerPair,
    }),
    [
      tokens,
      feeToken,
      initialLoadComplete,
      isLoadingBalances,
      isPriceLoading,
      isPricesLoaded,
      balanceError,
      priceError,
      registerPair,
    ],
  );

  return (
    <TokensContext.Provider value={value}>{children}</TokensContext.Provider>
  );
}
