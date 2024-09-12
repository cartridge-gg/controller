import { Container, Content, Footer } from "components/layout";
import {
  Button,
  HStack,
  Input,
  Spacer,
  Text,
  VStack,
  Divider,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  ArrowLineDownIcon,
  BravosIcon,
  DollarIcon,
  EthereumIcon,
} from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import { ETH_CONTRACT_ADDRESS } from "utils/token";
import { ErrorAlert } from "./ErrorAlert";
import { CopyAddress } from "./CopyAddress";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "generated/graphql";
import { formatEther, parseEther } from "viem";
import { useBalance } from "hooks/token";

export function Funding(innerProps: FundingInnerProps) {
  return (
    <ExternalWalletProvider>
      <FundingInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

type FundingInnerProps = {
  title?: React.ReactElement;
  defaultAmount: string;
  onComplete?: (deployHash?: string) => void;
};

function FundingInner({ onComplete, title }: FundingInnerProps) {
  const { account: extAccount } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { controller, chainId } = useConnection();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<"connect" | "fund">("connect");

  const [dollarAmount, setDollarAmount] = useState(5);
  const [ethAmount, setEthAmount] = useState<string>();

  const priceQuery = usePriceQuery({
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });
  const price = priceQuery.data?.price;

  const { balance: currentBalance, isLoading: isLoadingBalance } = useBalance({
    address: controller.address,
  });

  useEffect(() => {
    if (!price) return;

    const ethAmount = dollarAmount / parseFloat(price.amount);
    setEthAmount(ethAmount.toString());
  }, [dollarAmount, price]);

  const { toast } = useToast();

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
            recipient: controller.account.address,
            amount: cairo.uint256(parseEther(ethAmount)),
          }),
        },
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: controller.account.address,
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

  const usdBalance = useMemo(() => {
    if (!price || !currentBalance) {
      return 0;
    }

    return parseFloat(formatEther(currentBalance)) * parseFloat(price.amount);
  }, [currentBalance, price]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(controller.address);
    toast("Copied");
  }, [controller.address, toast]);

  if (isLoadingBalance) {
    return <></>;
  }

  return (
    <Container
      title={
        title || (
          <>
            Fund{" "}
            <b style={{ color: "brand.primary" }}>${controller.username}</b>
          </>
        )
      }
      description={<CopyAddress address={controller.address} />}
      Icon={ArrowLineDownIcon}
    >
      <Content gap={6}>
        <VStack w="full" borderRadius="base" overflow="hidden" spacing="1px">
          <HStack
            w="full"
            align="center"
            fontSize="sm"
            p={3}
            bg="solid.primary"
            fontWeight="semibold"
          >
            <Text
              textTransform="uppercase"
              fontSize="xs"
              color="text.secondary"
            >
              Balance
            </Text>
          </HStack>
          <HStack
            w="full"
            align="center"
            fontSize="sm"
            p={3}
            bg="solid.primary"
            fontWeight="semibold"
          >
            <HStack>
              <DollarIcon fontSize={20} />
              <Text>{usdBalance?.toFixed(2)}</Text>
            </HStack>
            <Spacer />
            <HStack color="text.secondary">
              <EthereumIcon fontSize={20} color="currentColor" />
              <Text color="inherit">
                {parseFloat(formatEther(currentBalance)).toFixed(5)}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Content>

      <Footer>
        <AmountSelection
          amount={dollarAmount}
          isLoading={isLoading}
          setAmount={setDollarAmount}
        />
        <Divider my="5px" borderColor="darkGray.900" />
        {error ? (
          <ErrorAlert
            title="Account deployment error"
            description={error.message}
          />
        ) : (
          <ErrorAlert
            variant="info"
            isExpanded
            title="Controller is in Alpha"
            description="Exercise caution when depositing funds"
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
                  <HStack w="full">
                    {connectors.length ? (
                      connectors
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
                        ))
                    ) : (
                      <Button flex="1" colorScheme="colorful" onClick={onCopy}>
                        copy address
                      </Button>
                    )}
                  </HStack>
                </>
              );
            case "fund":
              return (
                <Button
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
      provider={() => controller.account.rpc}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}

function AmountSelection({
  amount,
  isLoading,
  setAmount,
}: {
  amount: number;
  isLoading: boolean;
  setAmount: (number) => void;
}) {
  const amounts = [1, 5, 10];
  const [selected, setSelected] = useState<number>(1);
  const [custom, setCustom] = useState<boolean>(false);
  const { onOpen, onClose, isOpen } = useDisclosure();

  return (
    <HStack>
      <Text
        textTransform="uppercase"
        fontSize="xs"
        fontWeight="semibold"
        color="text.secondary"
      >
        Amount
      </Text>
      <Spacer />
      <VStack>
        <HStack>
          {amounts.map((value) => (
            <Button
              key={value}
              fontSize="sm"
              fontWeight="semibold"
              color={value === selected && !custom ? "white" : "text.secondary"}
              isDisabled={isLoading}
              onClick={() => {
                setCustom(false);
                setSelected(value);
                setAmount(value);
                onClose();
              }}
            >
              {`$${value}`}
            </Button>
          ))}
          <Button
            fontSize="sm"
            color={custom ? "white" : "text.secondary"}
            isDisabled={isLoading}
            onClick={() => {
              setCustom(true);
              onOpen();
            }}
          >
            Custom
          </Button>
        </HStack>
        {isOpen && (
          <Box position="relative" w="full">
            <Input
              pl="32px"
              h="40px"
              type="number"
              step={0.01}
              min={0.01}
              fontSize="sm"
              value={amount}
              isDisabled={isLoading}
              onChange={(e) => setAmount(e.target.value)}
            />
            <DollarIcon
              position="absolute"
              color="text.secondary"
              top="10px"
              left="10px"
              boxSize="20px"
            />
          </Box>
        )}
      </VStack>
    </HStack>
  );
}

// function useTokens() {
//   const { controller, prefunds } = useConnection();
//   const [tokens, setTokens] = useState<TokenInfo[]>([]);
//   const [isChecked, setIsChecked] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);

//   const remaining = useMemo(() => tokens.filter((t) => !isFunded(t)), [tokens]);

//   useEffect(() => {
//     fetchTokenInfo(prefunds).then(setTokens);
//   }, [prefunds, controller.account.address]);

//   const checkFunds = useCallback(async () => {
//     setIsFetching(true);

//     const checked = await updateBalance(tokens, controller);
//     setTokens(checked);

//     setIsFetching(false);
//     if (!isChecked) {
//       setIsChecked(true);
//     }
//   }, [tokens, controller, isChecked]);

//   useInterval(checkFunds, 3000);

//   return {
//     tokens,
//     remaining,
//     isAllFunded: remaining.length === 0,
//     isChecked,
//     isFetching,
//   };
// }
//

declare global {
  interface Window {
    starknet: any;
  }
}
