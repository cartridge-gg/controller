import { Container, Content, Footer } from "components/layout";
import {
  Button,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
  useInterval,
  useToast,
} from "@chakra-ui/react";
import {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  useAccount,
  useConnect,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import { Contract, RpcProvider, uint256 } from "starknet";
import {
  AlertIcon,
  CheckIcon,
  CoinsIcon,
  CopyHash,
  DEFAULT_TOAST_OPTIONS,
  EthereumIcon,
} from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { formatEther } from "viem";
import { Toaster } from "./Toaster";

export function Funding(innerProps: FundingInnerProps) {
  return (
    <ExternalWalletProvider>
      <FundingInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

type FundingInnerProps = {
  onComplete?: () => void;
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
      const amount = `0x${BigInt(t.min).toString(16)}`;
      return [
        {
          contractAddress: t.address,
          entrypoint: "approve",
          calldata: [controller.account.address, amount],
        },
        {
          contractAddress: t.address,
          entrypoint: "transfer",
          calldata: [controller.account.address, amount],
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
      const receipt = await controller.account.waitForTransaction(
        transaction_hash,
        {
          retryInterval: 1000,
        },
      );

      if (receipt.isRejected()) {
        throw new Error(
          "Transaction rejected: " +
            receipt.transaction_failure_reason.error_message,
        );
      }

      if (receipt.isReverted()) {
        throw new Error("Transaction everted: " + receipt.revert_reason);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (e) {
      setIsDeploying(false);
    }
  }, [
    controller.account,
    extAccount,
    controller,
    tokens,
    isAllFunded,
    onComplete,
  ]);

  const toast = useToast({
    ...DEFAULT_TOAST_OPTIONS,
    render: Toaster,
  });

  const onCopy = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();

      navigator.clipboard.writeText(controller.account.address);
      toast();
    },
    [controller.account.address, toast],
  );

  return (
    <Container
      title={`Fund ${controller.username}`}
      description={
        <CopyHash
          color="text.secondaryAccent"
          hash={controller.account.address}
        />
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
              {t.logo}
              <Text w="full">
                {t.address === ETH_CONTRACT
                  ? formatEther(BigInt(t.min))
                  : t.min}{" "}
                {t.symbol}
              </Text>
              <Spacer />
              {t.isFunded && <CheckIcon />}
            </HStack>
          ))}
        </VStack>
      </Content>

      <Footer>
        <Warning
          title="Controller is in Alpha"
          description="We recommend limiting deposits to necessary assets for now."
        />
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

function Warning({
  title,
  description,
}: {
  title: string;
  description?: string | ReactElement;
}) {
  return (
    <VStack
      w="full"
      borderRadius="md"
      px={5}
      py={3}
      bg="solid.secondary"
      alignItems="flex-start"
      gap={1}
    >
      <HStack>
        <AlertIcon />
        <Text casing="uppercase" fontSize="11px" as="b">
          {title}
        </Text>
      </HStack>

      <Text fontSize="xs" color="text.secondaryAccent">
        {description}
      </Text>
    </VStack>
  );
}

function ExternalWalletProvider({ children }: PropsWithChildren) {
  const { connectors } = useInjectedConnectors({});

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={() =>
        new RpcProvider({
          nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET,
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

  const remaining = useMemo(() => tokens.filter((t) => !t.isFunded), [tokens]);

  useEffect(() => {
    const target = [
      {
        address: ETH_CONTRACT,
        min: "100000000000000",
      },
      ...prefunds,
    ];
    if (!target.length) return;
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
          min: t.min,
          name: info.name,
          symbol: info.symbol,
          decimals: info.decimals,
          logo:
            t.address === ETH_CONTRACT ? (
              <EthereumIcon fontSize={20} />
            ) : (
              <Image
                src={info.logo_url}
                alt={`${info.name} ERC-20 Token Logo`}
                h={5}
              />
            ),
          isFunded: false,
        };
      });
      setTokens(tokens);
    }
  }, [prefunds, controller.account.address]);

  const setIsFundedBulk = useCallback(
    (funded: TokenInfo[]) => {
      if (funded.length === 0) return;

      const fundedAddrs = funded.map((f) => f.address);
      const newTokens = tokens.map((t) => ({
        ...t,
        isFunded: fundedAddrs.includes(t.address) ? true : t.isFunded,
      }));

      setTokens(newTokens);
    },
    [tokens],
  );

  const checkFunds = useCallback(async () => {
    const funded = await Promise.allSettled(
      remaining.map(async (t) => {
        const { abi } = await controller.account.getClassAt(t.address);
        const contract = new Contract(abi, t.address, controller.account);
        const { balance } = await contract.balanceOf(controller.address);

        return {
          ...t,
          isFunded: uint256.uint256ToBN(balance) >= BigInt(t.min),
        };
      }),
    );
    const res = funded
      .filter((res) => res.status === "fulfilled" && res.value.isFunded)
      .map((res) => (res as PromiseFulfilledResult<TokenInfo>).value);

    if (res.length) {
      setIsFundedBulk(res);
    }
  }, [remaining, setIsFundedBulk, controller.account]);

  useInterval(checkFunds, 3000);

  return {
    tokens,
    remaining,
    isAllFunded: !remaining || remaining.length === 0,
  };
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
  min: string;
  isFunded: boolean;
};
