import { Container, Content, Footer } from "components/layout";
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Text,
  VStack,
  Divider,
  useInterval,
} from "@chakra-ui/react";
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
  uint256,
  wallet,
} from "starknet";
import { ArrowLineDownIcon, EthereumIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import { ETH_CONTRACT_ADDRESS } from "utils/token";
import { ErrorAlert } from "./ErrorAlert";
import { CopyAddress } from "./CopyAddress";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "generated/graphql";
import { formatEther, parseEther } from "viem";

export function Funding(innerProps: FundingInnerProps) {
  return (
    <ExternalWalletProvider>
      <FundingInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

type FundingInnerProps = {
  onComplete: (deployHash?: string) => void;
  title?: React.ReactElement;
  defaultAmount: string;
};

function FundingInner({ onComplete, title, defaultAmount }: FundingInnerProps) {
  const { account: extAccount } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { controller, chainId } = useConnection();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<"connect" | "fund">("connect");

  const [amount, setAmount] = useState(() =>
    formatEther(BigInt(defaultAmount)),
  );
  const priceQuery = usePriceQuery({
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });
  const price = priceQuery.data?.price;

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
            amount: cairo.uint256(parseEther(amount)),
          }),
        },
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "transfer",
          calldata: CallData.compile({
            sender: extAccount.address,
            amount: cairo.uint256(parseEther(amount)),
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
      setIsLoading(false);
      setError(e);
    }
  }, [extAccount, controller, amount, onComplete]);

  const { balance: currentBalance } = useBalance();

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(controller.address);
    toast("Copied");
  }, [controller.address, toast]);

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
        <VStack w="full" borderRadius="base" overflow="hidden" gap={0.25}>
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
              Controller Balance
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
              <EthereumIcon fontSize={20} color="currentColor" />
              {<Text>{formatEther(currentBalance)}</Text>}
            </HStack>
          </HStack>
        </VStack>
      </Content>

      <Footer>
        <HStack>
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
            Amount
          </Text>
          <InputGroup size="sm" w={200}>
            <InputLeftElement>
              <EthereumIcon />
            </InputLeftElement>
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
            />
          </InputGroup>

          {price && (
            <>
              <Spacer />

              <Text fontSize="sm" fontWeight="500" color="text.secondary">
                ~ $
                {Math.round(
                  parseFloat(amount) * parseFloat(price.amount) * 100,
                ) / 100}
              </Text>
            </>
          )}
        </HStack>

        <Divider />
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
                  {connectors.length ? (
                    connectors
                      .filter((c) => ["argentX", "braavos"].includes(c.id))
                      .map((c) => (
                        <Button
                          key={c.id}
                          colorScheme="colorful"
                          onClick={() => onConnect(c)}
                        >
                          Connect {c.name}
                        </Button>
                      ))
                  ) : (
                    <Button colorScheme="colorful" onClick={onCopy}>
                      copy address
                    </Button>
                  )}
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

function useBalance() {
  const { controller } = useConnection();
  const [isFetching, setIsFetching] = useState(true);
  const [balance, setBalance] = useState(0n);

  const fetchBalance = useCallback(async () => {
    setIsFetching(true);

    const balance = await controller.account.callContract({
      contractAddress: ETH_CONTRACT_ADDRESS,
      entrypoint: "balanceOf",
      calldata: [controller.account.address],
    });

    setBalance(
      uint256.uint256ToBN({
        low: balance[0],
        high: balance[1],
      }),
    );
  }, [controller]);

  useInterval(fetchBalance, 3000);
  return { balance, isFetching };
}

declare global {
  interface Window {
    starknet: any;
  }
}
