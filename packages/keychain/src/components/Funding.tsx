import { Container, Content, Footer } from "components/layout";
import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useController } from "hooks/controller";
import { PropsWithChildren, ReactElement, useCallback, useEffect } from "react";
import { sepolia, mainnet, Chain } from "@starknet-react/chains";
import {
  Connector,
  StarknetConfig,
  argent,
  braavos,
  useAccount,
  useConnect,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import { RpcProvider } from "starknet";
import { AlertIcon, CoinsIcon, CopyHash } from "@cartridge/ui";

export function Funding() {
  const {
    controller: { account },
  } = useController();

  const deploy = useCallback(async () => {
    const res = await account.cartridge.deploySelf();
    console.log({ res });
  }, [account.cartridge]);

  return (
    <StarknetProvider>
      <FundingInner />
    </StarknetProvider>
  );
}

function FundingInner() {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { controller } = useController();

  const onConnect = useCallback(
    (connector: Connector) => () => {
      connect({ connector });
    },
    [connect],
  );

  useEffect(() => {
    if (!account || !controller.account) return;

    transfer();

    async function transfer() {
      const res = await account.execute([
        {
          contractAddress: account.address,
          entrypoint: "transfer",
          calldata: [controller.account?.address, "0x11C37937E08000"],
        },
      ]);
    }
  }, [account, controller]);

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
          You’ll need{" "}
          <Text as="b" color="text.secondary">
            ETH
          </Text>{" "}
          and{" "}
          <Text as="b" color="text.secondary">
            LORDS
          </Text>{" "}
          to play{" "}
          <Text as="b" color="text.secondary">
            Loot Survivor
          </Text>
          . Send some{" "}
          <Text as="b" color="text.secondary">
            testnet ETH
          </Text>{" "}
          to your controller address.
        </Text>
      </Content>

      <Footer>
        <Warning
          title="The controller is in alpha"
          description="Depositing funds into the controller is risky and they may not be recoverable"
        />
        {!account &&
          connectors.map((c) => (
            <Button
              key={c.id}
              bg="brand.primary"
              color="brand.primaryForeground"
              onClick={onConnect(c)}
            >
              Connect To {c.name}
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

function StarknetProvider({ children }: PropsWithChildren) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
  });

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={(chain: Chain) => {
        switch (chain) {
          case mainnet:
            return new RpcProvider({
              nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET,
            });
          case sepolia:
            return new RpcProvider({
              nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA,
            });
        }
      }}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}
