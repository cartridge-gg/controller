import { Container, Content, Footer } from "components/layout";
import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Spinner,
  Text,
  Tooltip,
  VStack,
  useInterval,
  Divider,
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
import { CallData, cairo, num } from "starknet";
import {
  AlertIcon,
  ArrowLineDownIcon,
  CheckIcon,
  DotsIcon,
  EthereumIcon,
} from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import {
  ETH_MIN_PREFUND,
  TokenInfo,
  fetchTokenInfo,
  getBalanceStr,
  isFunded,
  updateBalance,
} from "utils/token";
import { ErrorAlert } from "./ErrorAlert";
import { CopyAddress } from "./CopyAddress";
import { useDeploy } from "hooks/deploy";
import { JsControllerError } from "@cartridge/account-wasm";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "generated/graphql";
import { formatEther } from "viem";

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
  ctrlError?: JsControllerError;
};

function FundingInner({ onComplete, title, ctrlError }: FundingInnerProps) {
  const { account: extAccount } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { controller, chainId, chainName } = useConnection();
  const { tokens, isAllFunded, isChecked, isFetching } = useTokens();
  const { deploySelf, isDeploying } = useDeploy();
  const [error, setError] = useState<Error>();
  const [isSending, setIsSending] = useState(false);
  const [state, setState] = useState<"connect" | "fund" | "deploy">("connect");

  const details = ctrlError?.details ? JSON.parse(ctrlError?.details) : null;
  // const feeEstimate: string = details?.fee_estimate;
  const balance: string = details?.balance;

  // if (!feeEstimate || balance === undefined) {
  //   console.error("Failed to parse error details", error);
  //   return null;
  // }
  const [fundingAmount, setFundingAmount] = useState(() =>
    formatEther(BigInt(balance)),
  );
  const { data: countervalue } = usePriceQuery(
    { quote: CurrencyQuote.Eth, base: CurrencyBase.Usd },
    { enabled: !!balance },
  );

  const { toast } = useToast();
  useEffect(() => {
    if (isAllFunded && isChecked) {
      setState("deploy");
    }
  }, [isAllFunded, isChecked]);

  const onConnect = useCallback(
    (c: Connector) => {
      connectAsync({ connector: c })
        .then(async () => {
          const connectedChain = await c.chainId();
          if (num.toHex(connectedChain) !== chainId) {
            c.disconnect();
            toast("Please switch chain to: " + chainName);
            return;
          }

          setState("fund");
        })
        .catch(() => {
          /* user abort */
        });
    },
    [connectAsync, chainId, chainName, toast],
  );

  const onPrefund = useCallback(async () => {
    if (!extAccount) {
      throw new Error("External account is not connected");
    }
    if (!isChecked) {
      throw new Error("Fund check has not been done");
    }

    try {
      setIsSending(true);
      const calls = tokens.flatMap((t) => {
        if (typeof t.balance === "undefined") {
          throw new Error("Fund check has not been done");
        }
        const amount = cairo.uint256(t.min - t.balance);
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
    } catch (e) {
      setIsSending(false);
    }
  }, [extAccount, controller, tokens, isChecked]);

  const onDeploy = useCallback(async () => {
    try {
      const transaction_hash = await deploySelf(ETH_MIN_PREFUND);
      onComplete(transaction_hash);
    } catch (e) {
      if (e.message && e.message.includes("DuplicateTx")) {
        onComplete();
        return;
      }

      setError(e);
    }
  }, [onComplete, deploySelf]);

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
        <HStack w="full">
          <Text color="text.secondary" fontSize="sm">
            Send funds below to your controller address.
          </Text>

          <Spacer />

          {isFetching && <Spinner size="xs" color="text.secondary" />}
        </HStack>

        <VStack w="full" borderRadius="base" overflow="hidden" gap={0.25}>
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
                {t.logo}
                {typeof t.balance === "bigint" ? (
                  <Text>{getBalanceStr(t)}</Text>
                ) : !!t.error ? (
                  <DotsIcon />
                ) : (
                  <Spinner size="xs" />
                )}
                <Text>{t.symbol}</Text>
              </HStack>
              {isFunded(t) && <CheckIcon color="text.success" />}
              {!!t.error && (
                <Tooltip
                  label={t.error.message}
                  fontSize="xs"
                  bg="solid.bg"
                  color="text.primary"
                >
                  <Box>
                    <AlertIcon color="alert.foreground" />
                  </Box>
                </Tooltip>
              )}
            </HStack>
          ))}
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
              value={fundingAmount}
              onChange={(e) => {
                setFundingAmount(e.target.value);
              }}
            />
          </InputGroup>

          {countervalue && (
            <>
              <Spacer />

              {countervalue && (
                <Text fontSize="sm" fontWeight="500" color="text.secondary">
                  ~ ${countervalue.price.amount}
                </Text>
              )}
            </>
          )}
        </HStack>

        <Divider />

        {error && (
          <ErrorAlert
            title="Account deployment error"
            description={error.message}
          />
        )}
        <ErrorAlert
          variant="info"
          isExpanded
          title="Controller is in Alpha"
          description="Exercise caution when depositing funds"
        />

        {(() => {
          if (!isChecked) {
            return <Button colorScheme="colorful" isLoading />;
          }

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
                  onClick={onPrefund}
                  isLoading={isSending}
                >
                  Send Funds
                </Button>
              );
            case "deploy":
              <Button
                colorScheme="colorful"
                onClick={onDeploy}
                isLoading={isDeploying}
              >
                Deploy Controller
              </Button>;
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

function useTokens() {
  const { controller, prefunds } = useConnection();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const remaining = useMemo(() => tokens.filter((t) => !isFunded(t)), [tokens]);

  useEffect(() => {
    fetchTokenInfo(prefunds).then(setTokens);
  }, [prefunds, controller.account.address]);

  const checkFunds = useCallback(async () => {
    setIsFetching(true);

    const checked = await updateBalance(tokens, controller);
    setTokens(checked);

    setIsFetching(false);
    if (!isChecked) {
      setIsChecked(true);
    }
  }, [tokens, controller, isChecked]);

  useInterval(checkFunds, 3000);

  return {
    tokens,
    remaining,
    isAllFunded: remaining.length === 0,
    isChecked,
    isFetching,
  };
}
