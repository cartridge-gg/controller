import {
  ERC20Balance,
  useCountervalue,
  useCreditBalance,
  useERC20Balance,
  UseERC20BalanceResponse,
} from "@cartridge/ui/utils";
import {
  useBalanceQuery,
  useBalancesQuery,
} from "@cartridge/ui/utils/api/cartridge";
import makeBlockie from "ethereum-blockies-base64";
import { useAccount } from "./account";
import { useConnection } from "@/hooks/connection";
import { constants, getChecksumAddress } from "starknet";
import { useEffect, useMemo, useState } from "react";
import { erc20Metadata } from "@cartridge/presets";
import { useUsername } from "./username";
import * as torii from "@dojoengine/torii-wasm";

const CONTRACT_TYPES: torii.ContractType[] = ["ERC20"];

async function getToriiClient(project: string): Promise<torii.ToriiClient> {
  const url = `https://api.cartridge.gg/x/${project}/torii`;
  const client = await new torii.ToriiClient({
    toriiUrl: url,
    worldAddress: "0x0",
  });
  return client;
}

async function fetchContracts(
  client: torii.ToriiClient,
): Promise<torii.Contract[]> {
  return client.getContracts({
    contract_addresses: [],
    contract_types: CONTRACT_TYPES,
  });
}

const LIMIT = 1000;
export const TORII_MAINNET_TOKENS = "c7e-tokens-starknet";
export const TORII_SEPOLIA_TOKENS = "c7e-tokens-sepolia";

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
  const account = useAccount();
  const address = account?.address || "";
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
        const image =
          erc20Metadata.find(
            (m) =>
              getChecksumAddress(m.l2_token_address) ===
              getChecksumAddress(contractAddress),
          )?.logo_url || makeBlockie(getChecksumAddress(contractAddress));
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
  const account = useAccount();
  const connectedAddress = account?.address;
  const { project, chainId } = useConnection();
  const address = useMemo(
    () => accountAddress ?? connectedAddress,
    [accountAddress, connectedAddress],
  );

  const projects = useMemo(() => {
    return chainId === constants.StarknetChainId.SN_MAIN
      ? project
        ? [project, TORII_MAINNET_TOKENS]
        : [TORII_MAINNET_TOKENS]
      : chainId === constants.StarknetChainId.SN_SEPOLIA
        ? project
          ? [project, TORII_SEPOLIA_TOKENS]
          : [TORII_SEPOLIA_TOKENS]
        : project
          ? [project]
          : [];
  }, [project, chainId]);

  const { data, status } = useBalancesQuery(
    {
      accountAddress: address || "",
      projects: projects,
      limit: LIMIT,
    },
    {
      queryKey: ["balances", projects],
      enabled: projects.length > 0 && !!address,
    },
  );

  const tokens = useMemo(() => {
    const newTokens: { [key: string]: Token } = {};
    data?.balances?.edges?.forEach((e) => {
      const { amount, value, meta } = e.node;
      const { decimals, contractAddress, name, symbol, price, periodPrice } =
        meta;
      const previous = price !== 0 ? (value * periodPrice) / price : 0;
      const change = value - previous;
      const image =
        erc20Metadata.find(
          (m) =>
            getChecksumAddress(m.l2_token_address) ===
            getChecksumAddress(contractAddress),
        )?.logo_url || makeBlockie(getChecksumAddress(contractAddress));
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
    return Object.values(newTokens);
  }, [data]);

  return { tokens, status };
}

export type UseTokensResponse = {
  tokens: Token[];
  contracts: string[];
  credits: Token;
  status: "success" | "error" | "idle" | "loading";
};

export function useTokens(accountAddress?: string): UseTokensResponse {
  const { tokens: options, controller } = useConnection();
  const provider = controller?.provider;
  const account = useAccount();
  const address = account?.address || "";
  const { project } = useConnection();
  const [contracts, setContracts] = useState<string[]>([]);

  useEffect(() => {
    async function getContracts() {
      if (!project || !address) return;
      const client = await getToriiClient(project);
      const contracts = await fetchContracts(client);
      setContracts(
        contracts.map((c) => getChecksumAddress(c.contract_address)),
      );
    }
    getContracts();
  }, [project, address]);

  // Fetch credits
  const { username } = useUsername({ address });
  const creditBalance = useCreditBalance({
    username,
    interval: 30000,
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
  const { tokens: toriiTokens, status: toriiStatus } =
    useBalances(accountAddress);

  // Get token data from rpc (based on url options without those fetched from torii)
  const contractAddresses = useMemo(() => {
    // Don't filter out tokens during loading to prevent empty arrays
    return [...(contracts || []), ...(options || [])]?.filter(
      (token) =>
        !toriiTokens.find(
          (t) => BigInt(t.metadata.address || "0x0") === BigInt(token),
        ),
    );
  }, [options, toriiTokens, contracts]);

  const { data: rpcData }: UseERC20BalanceResponse = useERC20Balance({
    address: accountAddress ?? address,
    contractAddress: contractAddresses,
    provider,
    interval: 30000,
  });

  // Get tokens list from rpc that are not in torii
  const tokenData = useMemo(
    () =>
      rpcData
        .filter(
          (token) =>
            !toriiTokens.find(
              (t) =>
                BigInt(t.metadata.address || "0x0") ===
                BigInt(token.meta.address),
            ),
        )
        .map((token) => ({
          balance: `${Number(token.balance.value) / Math.pow(10, token.meta.decimals)}`,
          address: token.meta.address,
        })),
    [rpcData, toriiTokens],
  );

  // Get prices for filtered tokens
  const { countervalues } = useCountervalue(
    {
      tokens: tokenData,
    },
    { enabled: true },
  );

  // Merge data
  const tokens = useMemo(() => {
    const newData: UseBalancesResponse = { tokens: [], status: "success" };
    // Use a map to track tokens by their normalized address
    const tokenMap: Record<string, Token> = {};

    // Process tokens from rpcData
    rpcData.forEach((token: ERC20Balance) => {
      const contractAddress = token.meta.address;
      // Normalize the address by converting to BigInt and back to string
      const normalizedAddress = BigInt(contractAddress).toString();

      // Skip if we already have this token
      if (tokenMap[normalizedAddress]) return;

      const value = countervalues.find(
        (v) => BigInt(v?.address || "0x0") === BigInt(contractAddress),
      );
      const change = value ? value.current.value - value.period.value : 0;
      const image =
        erc20Metadata.find(
          (m) =>
            getChecksumAddress(m.l2_token_address) ===
            getChecksumAddress(contractAddress),
        )?.logo_url || makeBlockie(getChecksumAddress(contractAddress));
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
          image: image,
        },
      };
    });

    // Process tokens from toriiData
    toriiTokens.forEach((token) => {
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
    return newData;
  }, [rpcData, toriiTokens, countervalues]);

  // Determine combined status based on actual data availability
  const combinedStatus = useMemo(() => {
    // If torii is still loading on initial mount, show loading
    if (
      toriiStatus === "loading" &&
      toriiTokens.length === 0 &&
      rpcData.length === 0
    ) {
      return "loading";
    }
    // If torii had an error, return error
    if (toriiStatus === "error") {
      return "error";
    }
    // Otherwise we have successfully loaded (even if empty)
    return "success";
  }, [toriiStatus, toriiTokens.length, rpcData.length]);

  return { tokens: tokens.tokens, credits, contracts, status: combinedStatus };
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
