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
  useState,
} from "react";
import { mainnet } from "@starknet-react/chains";
import {
  Connector,
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

export function Funding() {
  return (
    <ExternalWalletProvider>
      <FundingInner />
    </ExternalWalletProvider>
  );
}

function FundingInner() {
  const { account: extAccount } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { controller } = useConnection();
  const tokens = useTokens();
  const [isSending, setIsSending] = useState(false);

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

  const deploy = useCallback(async () => {
    const res = await controller.account.cartridge.deploySelf();
    await controller.account.waitForTransaction(res.transaction_hash, {
      retryInterval: 1000,
    });
  }, [controller.account]);

  const prefundAndDeploy = useCallback(async () => {
    console.log("Requesting prefund transaction...");
    await prefund();

    console.log("Deploying account...");
    await deploy();

    console.log("Account is successfully deploed.");
  }, [prefund, deploy]);

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

  const onConnect = useCallback(
    (connector: Connector) => async () => {
      if (extAccount) return;

      setIsSending(true);

      try {
        await connectAsync({ connector });
      } catch (e) {
        console.error(e);
        setIsSending(false);
      }
    },
    [extAccount, connectAsync],
  );

  useEffect(() => {
    if (!extAccount || !isSending) return;

    try {
      prefundAndDeploy();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  }, [extAccount, isSending, prefundAndDeploy]);

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
        {connectors.length ? (
          connectors
            .filter((c) => ["argentX", "braavos"].includes(c.id))
            .map((c) => (
              <Button
                key={c.id}
                bg="brand.primary"
                color="brand.primaryForeground"
                onClick={onConnect(c)}
                isLoading={isSending}
              >
                Send from {c.name}
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

  useEffect(() => {
    const target = [
      {
        address: ETH_CONTRACT,
        min: "10000000000000000",
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
      tokens
        .filter((t) => !t.isFunded)
        .map(async (t) => {
          const { abi } = await controller.account.getClassAt(t.address);
          const contract = new Contract(abi, t.address, controller.account);
          const { balance } = await contract.balanceOf(t.address);

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
  }, [tokens, setIsFundedBulk, controller.account]);

  useInterval(checkFunds, 3000);

  return tokens;
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
