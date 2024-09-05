import { Container, Content, Footer } from "components/layout";
import { Button, useInterval } from "@chakra-ui/react";
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
  useProvider,
  voyager,
} from "@starknet-react/core";
import { RpcProvider, TypedData, Uint256, num } from "starknet";
import { PacmanIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import {
  TokenInfo,
  fetchTokenInfo,
  isFunded,
  updateBalance,
} from "utils/token";
import { ErrorAlert } from "../../ErrorAlert";
import { beginAccountSignup, finalizeAccountSignup } from "hooks/account";
import base64url from "base64url";

enum SignupState {
  CONNECT,
  SIGN_MESSAGE,
  DEPLOY,
}

const registerTypedData = (
  username: string,
  challenge: { low: string; high: string },
  chainId: string,
): TypedData => {
  return {
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "version", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "revision", type: "felt" },
      ],
      Register: [
        { name: "username", type: "felt" },
        { name: "challenge", type: "Challenge" },
      ],
      Challenge: [
        { name: "low", type: "felt" },
        { name: "high", type: "felt" },
      ],
    },
    primaryType: "Register",
    domain: {
      name: "Cartridge",
      chainId: chainId,
      version: "1",
      revision: "0",
    },
    message: {
      username: username,
      challenge: {
        low: challenge.low,
        high: challenge.high,
      },
    },
  };
};

export function SignupArgent({ username }: { username: string }) {
  return (
    <ExternalWalletProvider>
      <SignupArgentInner username={username} />
    </ExternalWalletProvider>
  );
}

function SignupArgentInner({ username }: { username: string }) {
  const { account: extAccount } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { chainId, chainName } = useConnection();
  const { isChecked } = useTokens();
  const [isDeploying] = useState(false);
  const [error, setError] = useState<Error>();
  const [state, setState] = useState<SignupState>(SignupState.CONNECT);
  //const [controllerAddress, setControllerAddress] = useState("");
  //const [controllerCalldata, setControllerCalldata] = useState([]);
  //const [title, setTitle] = useState("");

  const { toast } = useToast();

  // useEffect(() => {
  //   if (extAccount && isAllFunded && isChecked) {
  //     setState(SignupState.DEPLOY);
  //   }
  // }, [isAllFunded, isChecked, extAccount]);

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

          setState(SignupState.SIGN_MESSAGE);
        })
        .catch((e) => {
          /* user abort */
          console.log(e);
        });
    },
    [connectAsync, chainId, chainName, toast],
  );

  // useEffect(() => {
  //   if (state == SignupState.CONNECT) {
  //     setControllerAddress("");
  //   }
  //   if (state == SignupState.DEPLOY && extAccount?.address) {
  //     const salt = shortString.encodeShortString(username);

  //     const { address, calldata } = CartridgeAccount.getUdcDeployedAddress(
  //       salt,
  //       extAccount.address,
  //     );

  //     setControllerAddress(address);
  //     setControllerCalldata(calldata);
  //   }
  // }, [state, extAccount?.address, username]);

  const onSignMessage = useCallback(async () => {
    if (!extAccount) return;
    try {
      const challenge = await beginAccountSignup(username);
      const buffer = base64url.toBuffer(challenge);
      const high = "0x" + buffer.subarray(0, 16).toString("hex");
      const low = "0x" + buffer.subarray(16, 32).toString("hex");
      console.log({ high, low });
      console.log({ challenge: "0x" + buffer.toString("hex") });

      const typedData = registerTypedData(username, { low, high }, chainId);

      const hash = await extAccount.hashMessage(typedData);
      console.log({ hash });

      const sig = await extAccount.signMessage(typedData);
      const pubkey = await extAccount.signer.getPubKey();
      const finalizeMutation = await finalizeAccountSignup(
        extAccount.address,
        pubkey,
        sig as string[],
      );
      console.log({ finalizeMutation });

      setState(SignupState.DEPLOY);
    } catch (e) {
      console.log(e);
      setError(e);
    }
  }, [extAccount, username, chainId]);

  // const onDeploy = useCallback(async () => {
  //   if (!extAccount) return;

  //   const calls = tokens.flatMap((t) => {
  //     const amount = cairo.uint256(t.min);
  //     return [
  //       {
  //         contractAddress: t.address,
  //         entrypoint: "approve",
  //         calldata: CallData.compile({
  //           recipient: controllerAddress,
  //           amount,
  //         }),
  //       },
  //       {
  //         contractAddress: t.address,
  //         entrypoint: "transfer",
  //         calldata: CallData.compile({
  //           recipient: controllerAddress,
  //           amount,
  //         }),
  //       },
  //     ];
  //   });

  //   // deployContract
  //   const salt = shortString.encodeShortString(username);
  //   calls.push({
  //     contractAddress: CartridgeAccount.getUdcAddress(),
  //     entrypoint: "deployContract",
  //     calldata: CallData.compile({
  //       classHash: CartridgeAccount.getAccountClassHash(),
  //       salt,
  //       unique: false,
  //       calldata: controllerCalldata,
  //     }),
  //   });

  //   // registerSession
  //   calls.push({
  //     contractAddress: controllerAddress,
  //     entrypoint: "register_session",
  //     calldata: CartridgeAccount.registerSessionCalldata(
  //       policies.map((p) => {
  //         return { target: p.target, method: p.method };
  //       }),
  //       3000000000n,
  //       extAccount.address,
  //     ),
  //   });

  //   console.log(
  //     calls
  //       .map((call) => {
  //         return CallData.compile(call)
  //           .map((i) => `0x${BigInt(i).toString(16)}`)
  //           .join(" ");
  //       })
  //       .join(" / "),
  //   );

  //   try {
  //     setIsDeploying(true);
  //     const res = await extAccount.execute(calls);
  //     await extAccount.waitForTransaction(res.transaction_hash, {
  //       retryInterval: 1000,
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     setError(e);
  //   }
  //   setIsDeploying(false);
  // }, [
  //   extAccount,
  //   controllerAddress,
  //   controllerCalldata,
  //   policies,
  //   tokens,
  //   username,
  // ]);

  // const onCopy = useCallback(() => {
  //   navigator.clipboard.writeText(controllerAddress);
  //   toast("Copied");
  // }, [controllerAddress, toast]);

  // useEffect(() => {
  //   setTitle(!!extAccount ? `Create ${username}.gg` : `Create to Argent`);
  // }, [extAccount, username]);

  return (
    <Container
      variant="connect"
      title={"Connect to Argent"}
      description={"Sign message to create your account"}
      // TODO: Add line icons
      icon={<PacmanIcon color="brand.primary" fontSize="5xl" />}
    >
      <Content gap={6}>
        {/* {extAccount && (
          <>
            <HStack w="full">
              <Text color="text.secondary" fontSize="sm">
                Assets below will be send to your controller address.
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
                    <HStack>
                      {t.logo}
                      <Text>{t.balance}</Text>
                      {typeof t.balance === "bigint" ? (
                        <Text>{getBalanceStr(t)}</Text>
                      ) : !!t.error ? (
                        // <Text>...</Text>
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
                          <AlertIcon color="text.error" />
                        </Box>
                      </Tooltip>
                    )}
                  </HStack>

                  <Spacer />

                  <HStack gap={isEther(t) ? 2 : 3} color="text.secondary">
                    <Text color="inherit">send:</Text>
                    <HStack gap={isEther(t) ? 0 : 1}>
                      {t.logo}
                      <Text color="inherit">{getMinStr(t)}</Text>
                    </HStack>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </>
        )} */}
      </Content>

      <Footer isSignup={!extAccount} /*createSession={!!extAccount}*/>
        {error && (
          <ErrorAlert
            title="Account deployment error"
            description={error.message}
          />
        )}
        {!isChecked ? (
          <Button colorScheme="colorful" isLoading />
        ) : (
          <>
            {state === SignupState.CONNECT && (
              <>
                {connectors.length ? (
                  connectors
                    .filter((c) => ["argentX"].includes(c.id))
                    .map((c) => (
                      <Button
                        key={c.id}
                        colorScheme="colorful"
                        onClick={() => onConnect(c)}
                        isLoading={isConnecting}
                      >
                        Connect {c.name}
                      </Button>
                    ))
                ) : (
                  <Button
                    colorScheme="colorful"
                    onClick={() => {
                      console.log("copy address");
                    }}
                  >
                    copy address
                  </Button>
                )}
              </>
            )}

            {state === SignupState.SIGN_MESSAGE && (
              <Button colorScheme="colorful" onClick={onSignMessage}>
                Sign Message
              </Button>
            )}

            {state === SignupState.DEPLOY && (
              <Button
                colorScheme="colorful"
                onClick={() => {
                  console.log("deploy");
                }}
                isLoading={isDeploying}
                // isDisabled={!(isAllFunded && isChecked && extAccount)}
              >
                Create & Play
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
  const { rpcUrl } = useConnection();

  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={() => new RpcProvider({ nodeUrl: rpcUrl })}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}

function useTokens() {
  const { account: extAccount } = useAccount();
  const { provider } = useProvider();
  const { controller, prefunds } = useConnection();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const remaining = useMemo(() => tokens.filter((t) => !isFunded(t)), [tokens]);

  useEffect(() => {
    fetchTokenInfo(prefunds).then(setTokens);
  }, [prefunds, extAccount?.address]);

  const checkFunds = useCallback(async () => {
    setIsFetching(true);

    const checked = await updateBalance(tokens, provider, extAccount?.address);
    setTokens(checked);

    setIsFetching(false);
    if (!isChecked) {
      setIsChecked(true);
    }
  }, [tokens, controller, isChecked, extAccount?.address, provider]);

  useInterval(checkFunds, 3000);

  return {
    tokens,
    remaining,
    isAllFunded: remaining.length === 0,
    isChecked,
    isFetching,
  };
}
