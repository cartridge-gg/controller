import {
  useCountervalue,
  useERC20Balance,
  UseERC20BalanceResponse,
} from "@cartridge/utils";
import {
  useBalanceQuery,
  useBalancesQuery,
  useMetricsQuery,
} from "@cartridge/utils/api/cartridge";
import { useAccount } from "./account";
import { useConnection } from "./context";
import { getChecksumAddress } from "starknet";
import { useMemo, useState } from "react";
import { erc20Metadata } from "@cartridge/presets";
import { formatEther } from "viem";

const LIMIT = 1000;

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

  const { status } = useBalancesQuery(
    {
      accountAddress: address,
      projects: [project ?? ""],
      limit: LIMIT,
      offset: offset,
    },
    {
      queryKey: ["balances", offset],
      enabled: !!project && !!address,
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

export type UseTokensResponse = UseBalancesResponse;

export function useTokens(accountAddress?: string): UseTokensResponse {
  const { erc20: options, provider, isVisible } = useConnection();
  const { address } = useAccount();

  // Get token data from torii
  const toriiData = useBalances(accountAddress);

  // Get token data from rpc (based on url options)
  const { data: rpcData }: UseERC20BalanceResponse = useERC20Balance({
    address: accountAddress ?? address,
    contractAddress: options,
    provider,
    interval: isVisible ? 3000 : undefined,
  });

  // Get tokens list from rpc that are not in torii
  const tokenData = useMemo(
    () =>
      rpcData
        .filter(
          (token) =>
            !toriiData.tokens.find(
              (t) => t.metadata.address === token.meta.address,
            ),
        )
        .map((token) => ({
          balance: formatEther(token.balance.value || 0n),
          address: token.meta.address,
        })),
    [rpcData, toriiData],
  );

  // Get prices for filtered tokens
  const { countervalues } = useCountervalue({
    tokens: tokenData,
  });

  // Merge data
  const data = useMemo(() => {
    const newData: UseBalancesResponse = { tokens: [], status: "success" };
    rpcData.forEach((token) => {
      const contractAddress = token.meta.address;
      // If already exists in torii data, skip
      if (
        newData.tokens?.find(
          (token) => BigInt(token.metadata.address) === BigInt(contractAddress),
        )
      )
        return;

      // Otherwise, add to data
      const value = countervalues.find(
        (v) => BigInt(v?.address || "0x0") === BigInt(contractAddress),
      );
      const change = value ? value.current.value - value.period.value : 0;
      const newToken: Token = {
        balance: {
          amount: Number(token.balance.value) / 10 ** token.meta.decimals,
          value: value?.current.value || 0,
          change,
        },
        metadata: {
          name: token.meta.name,
          symbol: token.meta.symbol,
          decimals: token.meta.decimals,
          address: contractAddress,
          image: token.meta.logoUrl,
        },
      };
      newData.tokens?.push(newToken);
    });
    newData.tokens?.push(...toriiData.tokens);
    newData.status = toriiData.status;
    return newData;
  }, [rpcData, toriiData, countervalues]);
  return data;
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
        getChecksumAddress(token.metadata.address) ===
        getChecksumAddress(tokenAddress),
    ),
    status,
  };
}

export function useMetrics({ projectName }: { projectName: string }) {
  const {
    data: _data,
    isLoading,
    isError,
    isSuccess,
  } = useMetricsQuery({
    projects: { project: projectName },
  });

  const data = _data?.metrics.items || [];

  return {
    data,
    isLoading,
    isError,
    isSuccess,
  };
}
