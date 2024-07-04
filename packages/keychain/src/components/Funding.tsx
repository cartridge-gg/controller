import { Container, Content, Footer } from "components/layout";
import { Button, HStack, Image, Spacer, Text, VStack } from "@chakra-ui/react";
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
import { AlertIcon, CheckIcon, CoinsIcon, CopyHash, EthereumIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";

export function Funding() {
  return (
    <ExternalWalletProvider>
      <FundingInner />
    </ExternalWalletProvider>
  );
}

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
  logo: string;
  min: string;
  isFunded: boolean;
};

function useTokens() {
  const { controller, prefunds } = useConnection();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  useEffect(() => {
    fetchTokneInfo();

    async function fetchTokneInfo() {
      const res = await fetch("https://mainnet-api.ekubo.org/tokens");
      const data: TokenInfoRaw[] = await res.json();
      const tokens = prefunds.map((t) => {
        const info = data.find(
          ({ l2_token_address }) => l2_token_address === t.address,
        );

        return {
          address: t.address,
          min: t.min,
          name: info.name,
          symbol: info.symbol,
          decimals: info.decimals,
          logo: info.logo_url,
          isFunded: false,
        };
      });

      setTokens(tokens);
    }
  }, [prefunds, controller.account.address]);

  return tokens;
}

const ETH_CONTRACT = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

function FundingInner() {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { controller } = useConnection();
  const [isEthFunded, setIsEthFunded] = useState(false);
  const tokens = useTokens();


  const onConnect = useCallback(
    (connector: Connector) => () => {
      connect({ connector });
    },
    [connect],
  );

  // const prefund = useCallback(async () => {
  //   if (!account || !controller.account) return;

  //   const ethAmount = "0x0"
  //   const prefundRes = await account.execute([
  //     {
  //       contractAddress: account.address,
  //       entrypoint: "approve",
  //       calldata: [controller.account?.address, ethAmount],
  //     },
  //     {
  //       contractAddress: account.address,
  //       entrypoint: "transfer",
  //       calldata: [controller.account?.address, ethAmount],
  //     },
  //     // TODO: ERC20
  //   ]);
  //   await account.waitForTransaction(prefundRes.transaction_hash, { retryInterval: 1000 });
  // }, [account, controller])

  const checkFunds = useCallback(async () => {
    const { abi } = await controller.account.rpc.getClassAt(ETH_CONTRACT);
    const contract = new Contract(abi, ETH_CONTRACT, controller.account.rpc);
    const { balance } = await contract.balanceOf(controller.account.address);

    if (uint256.uint256ToBN(balance) >= 10000000000000000n) {
      setIsEthFunded(true)
    }
  }, [controller.account])

  useEffect(() => {
    checkFunds();
    // prefundAndDeploy();

    // async function prefundAndDeploy() {
    //   await prefund();
    //   // const res = await controller.account.cartridge.deploySelf();
    //   // TODO: set
    // }

  }, [checkFunds]);

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
          <HStack
            w="full"
            align="center"
            fontSize="sm"
            p={3}
            bg="solid.primary"
            fontWeight="semibold"
          >
            <EthereumIcon fontSize={20} />
            <Text w="full">0.01 ETH</Text>
            <Spacer />
            {isEthFunded && <CheckIcon />}
          </HStack>

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
              <Image src={t.logo} alt={`${t.name} ERC-20 Token Logo`} h={5} />
              <Text w="full">
                {t.min} {t.symbol}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Content>

      <Footer>
        <Warning
          title="The controller is in alpha"
          description="Depositing funds into the controller is risky and they may not be recoverable"
        />
        {connectors
          .filter((c) => ["argentX", "braavos"].includes(c.id))
          .map((c) => (
            <Button
              key={c.id}
              bg="brand.primary"
              color="brand.primaryForeground"
              onClick={onConnect(c)}
              isLoading={!!account}
            >
              Send from {c.name}
            </Button>
          ))}
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
