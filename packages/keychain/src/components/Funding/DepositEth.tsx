import { Container, Content, Footer } from "components/layout";
import { Button, HStack, Text, VStack, Divider } from "@chakra-ui/react";
import { PropsWithChildren, useCallback, useState } from "react";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  Connector,
  StarknetConfig,
  useAccount,
  useConnect,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import {
  CallData,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  cairo,
  num,
  wallet,
} from "starknet";
import {
  ArgentIcon,
  BravosIcon,
  CopyIcon,
  EthereumIcon,
  StarknetColorIcon,
} from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import { ETH_CONTRACT_ADDRESS } from "utils/token";
import { ErrorAlert } from "../ErrorAlert";
import { CopyAddress } from "components/CopyAddress";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "generated/graphql";
import { parseEther } from "viem";
import AmountSelection, { DEFAULT_AMOUNT } from "./AmountSelection";
import { Balance } from "./Balance";

type DepositEthProps = {
  onComplete?: (deployHash?: string) => void;
  onBack: () => void;
};

export function DepositEth(innerProps: DepositEthProps) {
  return (
    <ExternalWalletProvider>
      <DepositEthInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

function DepositEthInner({ onComplete, onBack }: DepositEthProps) {
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { controller, chainId } = useConnection();
  const { account: extAccount } = useAccount();
  const { toast } = useToast();

  const [dollarAmount, setDollarAmount] = useState<number>(DEFAULT_AMOUNT);
  const [state, setState] = useState<"connect" | "fund">("connect");
  const [ethAmount, setEthAmount] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const priceQuery = usePriceQuery({
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });
  const price = priceQuery.data?.price;

  const onAmountChagned = useCallback(
    (amount: number) => {
      if (!price) return;

      const ethAmount = amount / parseFloat(price.amount);
      setEthAmount(ethAmount.toString());
      setDollarAmount(amount);
    },
    [price],
  );

  const onConnect = useCallback(
    (c: Connector) => {
      connectAsync({ connector: c })
        .then(async () => {
          const connectedChain = await c.chainId();
          if (num.toHex(connectedChain) !== chainId) {
            await wallet.switchStarknetChain(window.starknet, chainId);
          }

          setState("fund");
        })
        .catch(() => {
          /* user abort */
        });
    },
    [connectAsync, chainId],
  );

  const onFund = useCallback(async () => {
    if (!extAccount) {
      throw new Error("External account is not connected");
    }

    try {
      setIsLoading(true);
      const calls = [
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "approve",
          calldata: CallData.compile({
            recipient: controller.address,
            amount: cairo.uint256(parseEther(ethAmount)),
          }),
        },
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: controller.address,
            amount: cairo.uint256(parseEther(ethAmount)),
          }),
        },
      ];
      const res = await extAccount.execute(calls);
      await extAccount.waitForTransaction(res.transaction_hash, {
        retryInterval: 1000,
        successStates: [
          TransactionExecutionStatus.SUCCEEDED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      });

      onComplete(res.transaction_hash);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [extAccount, controller, ethAmount, onComplete]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(controller.address);
    toast("Copied");
  }, [controller.address, toast]);

  return (
    <Container
      title="Deposit ETH"
      description={<CopyAddress address={controller.address} />}
      Icon={EthereumIcon}
      onBack={onBack}
    >
      <Content gap={6}>
        <Balance showBalances={["eth"]} />
      </Content>

      <Footer>
        <AmountSelection
          amount={dollarAmount}
          lockSelection={isLoading}
          onChange={onAmountChagned}
        />
        <Divider my="5px" borderColor="darkGray.900" />
        {error && (
          <ErrorAlert
            title="Account deployment error"
            description={error.message}
          />
        )}

        {(() => {
          switch (state) {
            case "connect":
              if (isConnecting) {
                return <Button colorScheme="colorful" isLoading />;
              }

              return (
                <>
                  <VStack spacing="20px">
                    <HStack w="full">
                      {connectors
                        .filter((c) => ["argentX", "braavos"].includes(c.id))
                        .map((c) => (
                          <Button
                            key={c.id}
                            gap="5px"
                            flex="1"
                            colorScheme="colorful"
                            onClick={() => onConnect(c)}
                          >
                            {c.name === "argentX" && (
                              <ArgentIcon fontSize={20} />
                            )}
                            {c.name === "braavos" && (
                              <BravosIcon fontSize={20} />
                            )}
                            {c.name}
                          </Button>
                        ))}
                    </HStack>
                    {connectors.length !== 0 && (
                      <Text
                        color="text.secondary"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        OR
                      </Text>
                    )}
                    <Button w="full" gap="5px" onClick={onCopy}>
                      <CopyIcon fontSize={20} /> copy address
                    </Button>
                    <HStack>
                      <Text color="text.secondary" fontSize="14px">
                        and send funds to it on
                      </Text>
                      <HStack
                        border="1px"
                        borderRadius="5px"
                        p="5px"
                        borderColor="darkGray.700"
                      >
                        <StarknetColorIcon />{" "}
                        <Text fontSize="12px" fontWeight="bold">
                          STARKNET MAINNET
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </>
              );
            case "fund":
              return (
                <Button
                  w="full"
                  colorScheme="colorful"
                  onClick={onFund}
                  isLoading={isLoading}
                >
                  Send Funds
                </Button>
              );
          }
        })()}
      </Footer>
    </Container>
  );
}

function ExternalWalletProvider({ children }: PropsWithChildren) {
  const { connectors } = useInjectedConnectors({});
  const { controller } = useConnection();

  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={() => controller}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}

declare global {
  interface Window {
    starknet: any;
  }
}
