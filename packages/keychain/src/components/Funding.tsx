import { Container, Content, Footer } from "components/layout";
import {
  Button,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
  useInterval,
} from "@chakra-ui/react";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  useAccount,
  useConnect,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import { CallData, RpcProvider, cairo, uint256 } from "starknet";
import { CheckIcon, CoinsIcon, CopyIcon, EthereumIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { formatEther } from "viem";
import { useCopyAndToast } from "./Toaster";
import { Prefund } from "@cartridge/controller";
import { AlphaWarning } from "./Warning";
import { formatAddress } from "utils/contracts";

export function Funding(innerProps: FundingInnerProps) {
  return (
    <ExternalWalletProvider>
      <FundingInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

type FundingInnerProps = {
  onComplete?: (deployHash: string) => void;
};

function FundingInner({ onComplete }: FundingInnerProps) {
  const { account: extAccount, isConnecting: isExtConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { controller } = useConnection();
  const { tokens, isAllFunded } = useTokens();
  const [isDeploying, setIsDeploying] = useState(false);

  const prefund = useCallback(async () => {
    if (!extAccount) {
      throw new Error("External account is not connected");
    }

    const calls = tokens.flatMap((t) => {
      const amount = cairo.uint256(t.min);
      return [
        {
          contractAddress: t.address,
          entrypoint: "approve",
          calldata: CallData.compile({
            recipient: controller.account.address,
            amount,
          }),
        },
        {
          contractAddress: t.address,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: controller.account.address,
            amount,
          }),
        },
      ];
    });
    const res = await extAccount.execute(calls);
    await extAccount.waitForTransaction(res.transaction_hash, {
      retryInterval: 1000,
    });
  }, [extAccount, controller, tokens]);

  const onDeploy = useCallback(async () => {
    try {
      setIsDeploying(true);
      if (!isAllFunded) await prefund();
      const { transaction_hash } =
        await controller.account.cartridge.deploySelf();

      if (onComplete) {
        onComplete(transaction_hash);
      }
    } catch (e) {
      setIsDeploying(false);
    }
  }, [controller.account, isAllFunded, onComplete, prefund]);

  const copyAndToast = useCopyAndToast();
  const onCopy = useCallback(() => {
    copyAndToast(formatAddress(controller.account.address));
  }, [copyAndToast, controller.account.address]);

  return (
    <Container
      title={`Fund ${controller.username}`}
      description={
        <HStack onClick={onCopy} _hover={{ cursor: "pointer" }}>
          <Text color="text.secondaryAccent">
            {formatAddress(controller.account.address, { first: 20, last: 10 })}
          </Text>
          <CopyIcon />
        </HStack>
      }
      // TODO: Add line icons
      Icon={CoinsIcon}
    >
      <Content>
        <Text color="text.secondary" fontSize="sm">
          Send assets below to your controller address.
        </Text>

        <VStack w="full" borderRadius="md" overflow="hidden" gap={0.25}>
          {tokens.map((t) => (
            <HStack
              key={t.address}
              w="full"
              align="center"
              fontSize="sm"
              p={3}
              bg="solid.primary"
              fontWeight="semibold"
            >
              <HStack>
                <HStack>
                  {t.logo}
                  <Text>
                    {getBalanceStr(t)} {t.symbol}
                  </Text>
                </HStack>
                {isFunded(t) && <CheckIcon />}
              </HStack>

              <Spacer />

              <HStack gap={isEther(t) ? 2 : 3} color="text.secondary">
                <Text color="inherit">min:</Text>
                <HStack gap={isEther(t) ? 0 : 1}>
                  {t.logo}
                  <Text color="inherit">{getMinStr(t)}</Text>
                </HStack>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Content>

      <Footer>
        <AlphaWarning />

        {extAccount || isAllFunded ? (
          <Button
            bg="brand.primary"
            color="brand.primaryForeground"
            onClick={onDeploy}
            isLoading={isDeploying}
          >
            Deploy Controller
          </Button>
        ) : (
          <>
            {connectors.length ? (
              connectors
                .filter((c) => ["argentX", "braavos"].includes(c.id))
                .map((c) => (
                  <Button
                    key={c.id}
                    bg="brand.primary"
                    color="brand.primaryForeground"
                    onClick={() => connect({ connector: c })}
                    isLoading={isExtConnecting}
                  >
                    Connect {c.name}
                  </Button>
                ))
            ) : (
              <Button
                bg="brand.primary"
                color="brand.primaryForeground"
                onClick={onCopy}
              >
                copy address
              </Button>
            )}
          </>
        )}
      </Footer>
    </Container>
  );
}

function ExternalWalletProvider({ children }: PropsWithChildren) {
  const { connectors } = useInjectedConnectors({});

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={() =>
        new RpcProvider({
          nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA,
        })
      }
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}

function useTokens() {
  const { controller, prefunds } = useConnection();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  const remaining = useMemo(() => tokens.filter((t) => !isFunded(t)), [tokens]);

  useEffect(() => {
    const target = [
      {
        address: ETH_CONTRACT,
        min: "200000000000000",
      },
      ...prefunds,
    ];
    fetchTokneInfo();

    async function fetchTokneInfo() {
      const res = await fetch("https://mainnet-api.ekubo.org/tokens");
      const data: TokenInfoRaw[] = await res.json();
      const tokens = target.map((t) => {
        const info = data.find(
          ({ l2_token_address }) => l2_token_address === t.address,
        );

        return {
          address: t.address,
          min: BigInt(t.min),
          name: info.name,
          symbol: info.symbol,
          decimals: info.decimals,
          logo: isEther(t) ? (
            <EthereumIcon fontSize={20} color="currentColor" />
          ) : (
            <Image
              src={info.logo_url}
              alt={`${info.name} ERC-20 Token Logo`}
              h={5}
            />
          ),
          balance: BigInt(0),
        };
      });
      setTokens(tokens);
    }
  }, [prefunds, controller.account.address]);

  const checkFunds = useCallback(async () => {
    const funded = await Promise.allSettled(
      remaining.map(async (t) => {
        const balance = await controller.account.callContract({
          contractAddress: t.address,
          entrypoint: "balanceOf",
          calldata: [controller.account.address],
        });

        return {
          ...t,
          balance: uint256.uint256ToBN({
            low: balance[0],
            high: balance[1],
          }),
        };
      }),
    );
    const res = funded
      .filter((res) => res.status === "fulfilled" && isFunded(res.value))
      .map((res) => (res as PromiseFulfilledResult<TokenInfo>).value);

    if (res.length) {
      setTokens(res);
    }
  }, [remaining, controller.account]);

  useInterval(checkFunds, 3000);

  return {
    tokens,
    remaining,
    isAllFunded: remaining.length === 0,
  };
}

function isFunded(t: TokenInfo) {
  return t.min <= t.balance;
}

function isEther(t: Prefund | TokenInfo) {
  return t.address === ETH_CONTRACT;
}

function getBalanceStr(t: TokenInfo) {
  return isEther(t) ? formatEther(t.balance) : t.balance.toString();
}

function getMinStr(t: TokenInfo) {
  return isEther(t) ? formatEther(t.min) : t.min.toString();
}

const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

type TokenInfoRaw = {
  name: string;
  symbol: string;
  decimals: number;
  l2_token_address: string;
  sort_order: string;
  total_supply: number;
  logo_url: string;
};

type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logo: React.ReactNode;
  min: bigint;
  balance: bigint;
};
