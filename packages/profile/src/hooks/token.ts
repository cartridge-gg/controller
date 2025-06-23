import {
  useCountervalue,
  useCreditBalance,
  useERC20Balance,
  UseERC20BalanceResponse,
} from "@cartridge/ui/utils";
import {
  useBalanceQuery,
  useBalancesQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useAccount } from "./account";
import { useConnection } from "./context";
import { getChecksumAddress } from "starknet";
import { useMemo, useState } from "react";
import { erc20Metadata } from "@cartridge/presets";
import { useUsername } from "./username";

const LIMIT = 1000;
export const TOKENS_TORII_INSTANCE = "c7e-arcade-tokens";

export type Balance = {
  amount: number;
  value: number;
  change: number;
};

export type Metadata = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  image: string | undefined;
};

export type Token = {
  balance: Balance;
  metadata: Metadata;
};

export type UseBalanceResponse = {
  token?: Token;
  status: "success" | "error" | "idle" | "loading";
};

export function useBalance({
  tokenAddress,
}: {
  tokenAddress?: string;
}): UseBalanceResponse {
  const { address } = useAccount();
  const { project } = useConnection();
  const [token, setToken] = useState<Token | undefined>(undefined);
  const { status } = useBalanceQuery(
    {
      projects: [project ?? ""],
      accountAddress: address,
      tokenAddress: tokenAddress ?? "",
    },
    {
      queryKey: ["balance"],
      enabled: !!project && !!address,
      onSuccess: ({ balance }) => {
        const { amount, value, meta } = balance;
        const { decimals, contractAddress, name, symbol, price, periodPrice } =
          meta;
        const previous = price !== 0 ? (value * periodPrice) / price : 0;
        const change = value - previous;
        const image = erc20Metadata.find(
          (m) =>
            getChecksumAddress(m.l2_token_address) ===
            getChecksumAddress(contractAddress),
        )?.logo_url;
        const token: Token = {
          balance: {
            amount: amount,
            value: value,
            change: change,
          },
          metadata: {
            address: contractAddress,
            name: name,
            symbol: symbol,
            image: image,
            decimals: decimals,
          },
        };
        setToken(token);
      },
    },
  );

  return { token, status };
}

export type UseBalancesResponse = {
  tokens: Token[];
  status: "success" | "error" | "idle" | "loading";
};

export function useBalances(accountAddress?: string): UseBalancesResponse {
  const { address: connectedAddress } = useAccount();
  const { project } = useConnection();
  const [offset, setOffset] = useState(0);
  const [tokens, setTokens] = useState<{ [key: string]: Token }>({});
  const address = useMemo(
    () => accountAddress ?? connectedAddress,
    [accountAddress, connectedAddress],
  );

  const projects = useMemo(() => {
    return project ? [project, TOKENS_TORII_INSTANCE] : [];
  }, [project]);

  const { status } = useBalancesQuery(
    {
      accountAddress: address,
      projects: projects,
      limit: LIMIT,
      offset: offset,
    },
    {
      queryKey: ["balances", offset, projects],
      enabled: projects.length > 0 && !!address,
      onSuccess: ({ balances }) => {
        const newTokens: { [key: string]: Token } = {};
        balances?.edges.forEach((e) => {
          const { amount, value, meta } = e.node;
          const {
            decimals,
            contractAddress,
            name,
            symbol,
            price,
            periodPrice,
          } = meta;
          const previous = price !== 0 ? (value * periodPrice) / price : 0;
          const change = value - previous;
          const image = erc20Metadata.find(
            (m) =>
              getChecksumAddress(m.l2_token_address) ===
              getChecksumAddress(contractAddress),
          )?.logo_url;
          const token: Token = {
            balance: {
              amount: amount,
              value: value,
              change,
            },
            metadata: {
              name,
              symbol,
              decimals,
              address: contractAddress,
              image,
            },
          };
          newTokens[`${contractAddress}`] = token;
        });
        if (balances?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setTokens((prev) => ({ ...prev, ...newTokens }));
      },
    },
  );

  return { tokens: Object.values(tokens), status };
}

export type UseTokensResponse = {
  tokens: Token[];
  credits: Token;
  status: "success" | "error" | "idle" | "loading";
};

export function useTokens(accountAddress?: string): UseTokensResponse {
  const { erc20: options, provider, isVisible } = useConnection();
  const { address } = useAccount();

  // Fetch credits
  const { username } = useUsername({ address });
  const creditBalance = useCreditBalance({
    username,
    interval: isVisible ? 30000 : undefined,
  });
  const credits: Token = useMemo(() => {
    return {
      balance: {
        amount: Number(creditBalance.balance.value) / 10 ** 6,
        value: 0,
        change: 0,
      },
      metadata: {
        name: "Credits",
        symbol: "Credits",
        decimals: 6,
        address: "credit",
        image: "https://static.cartridge.gg/presets/credit/icon.svg",
      },
    };
  }, [creditBalance]);

  // Get token data from torii
  const toriiData = useBalances(accountAddress);

  // Get token data from rpc (based on url options without those fetched from torii)
  const contractAddress = useMemo(() => {
    if (toriiData.status !== "success") return [];
    return options.filter(
      (token) =>
        !toriiData.tokens.find(
          (t) => BigInt(t.metadata.address || "0x0") === BigInt(token),
        ),
    );
  }, [options, toriiData]);

  const { data: rpcData }: UseERC20BalanceResponse = useERC20Balance({
    address: accountAddress ?? address,
    contractAddress: contractAddress,
    provider,
    interval: isVisible ? 30000 : undefined,
  });

  // Get tokens list from rpc that are not in torii
  const tokenData = useMemo(
    () =>
      rpcData
        .filter(
          (token) =>
            !toriiData.tokens.find(
              (t) =>
                BigInt(t.metadata.address || "0x0") ===
                BigInt(token.meta.address),
            ),
        )
        .map((token) => ({
          balance: `${Number(token.balance.value) / Math.pow(10, token.meta.decimals)}`,
          address: token.meta.address,
        })),
    [rpcData, toriiData],
  );

  // Get prices for filtered tokens
  const { countervalues } = useCountervalue(
    {
      tokens: tokenData,
    },
    { enabled: isVisible },
  );

  // Merge data
  const tokens = useMemo(() => {
    const newData: UseBalancesResponse = { tokens: [], status: "success" };
    // Use a map to track tokens by their normalized address
    const tokenMap: Record<string, Token> = {};

    // Process tokens from rpcData
    rpcData.forEach((token) => {
      const contractAddress = token.meta.address;
      // Normalize the address by converting to BigInt and back to string
      const normalizedAddress = BigInt(contractAddress).toString();

      // Skip if we already have this token
      if (tokenMap[normalizedAddress]) return;

      const value = countervalues.find(
        (v) => BigInt(v?.address || "0x0") === BigInt(contractAddress),
      );
      const change = value ? value.current.value - value.period.value : 0;
      tokenMap[normalizedAddress] = {
        balance: {
          amount: Number(token.balance.value) / 10 ** token.meta.decimals,
          value: value?.current.value || 0,
          change,
        },
        metadata: {
          name: token.meta.name,
          symbol: token.meta.symbol,
          decimals: token.meta.decimals,
          address: getChecksumAddress(contractAddress),
          image: token.meta.logoUrl,
        },
      };
    });

    // Process tokens from toriiData
    toriiData.tokens.forEach((token) => {
      const normalizedAddress = BigInt(
        token.metadata.address || "0x0",
      ).toString();
      // Only add if we don't already have this token
      if (!tokenMap[normalizedAddress]) {
        tokenMap[normalizedAddress] = token;
      }
    });

    // Convert the map back to an array
    newData.tokens = Object.values(tokenMap);
    newData.status = toriiData.status;
    return newData;
  }, [rpcData, toriiData, countervalues]);
  return { tokens: tokens.tokens, credits, status: tokens.status };
}

export type UseTokenResponse = UseBalanceResponse;

export function useToken({
  tokenAddress,
  accountAddress,
}: {
  accountAddress?: string;
  tokenAddress: string;
}): UseTokenResponse {
  const { tokens, status } = useTokens(accountAddress);
  return {
    token: tokens.find(
      (token) =>
        getChecksumAddress(token.metadata.address || "0x0") ===
        getChecksumAddress(tokenAddress),
    ),
    status,
  };
}
