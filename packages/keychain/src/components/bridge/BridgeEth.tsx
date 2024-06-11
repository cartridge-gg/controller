import {
  Box,
  Circle,
  Flex,
  forwardRef,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { fetchBalance } from "@wagmi/core";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";
import { useDebounce } from "hooks/debounce";
import { useEffect, useState } from "react";
import { constants } from "starknet";
import { createConfig, mainnet, WagmiConfig, configureChains } from "wagmi";
import { sepolia } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { ConnectButton } from "./ConnectButton";
import { TransferButton } from "./TransferButton";
import { TxnTracker } from "./Transactions";
import { Label } from "./Label";
import Controller from "utils/controller";
import { Banner } from "components/layout";
import { Error } from "components/Error";
import {
  CheckIcon,
  EthereumDuoIcon,
  EthereumIcon,
  MetaMaskIcon,
  WedgeDownIcon,
} from "@cartridge/ui";

export function BridgeEth({
  chainId,
  controller,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
}) {
  const [ethAddress, setEthAddress] = useState<string>();
  const [ethBalance, setEthBalance] = useState<string>();
  const [transferAmount, setTransferAmount] = useState<string>();
  const { debouncedValue, debouncing } = useDebounce(transferAmount, 1000);
  const [transferAmountCost, setTransferAmountCost] = useState<string>();
  const [transferAmountInvalid, setTransferAmountInvalid] = useState<boolean>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [transferHash, setTransferHash] = useState<string>();

  useEffect(() => {
    if (!!ethAddress) {
      const balance = async () => {
        return await fetchBalance({
          address: ethAddress as any,
          chainId:
            chainId === constants.StarknetChainId.SN_MAIN
              ? mainnet.id
              : sepolia.id,
        });
      };
      balance().then((res) => {
        setEthBalance(parseFloat(res.formatted).toFixed(4));
      });
    } else {
      setEthBalance(undefined);
    }
  }, [ethAddress, setEthBalance, chainId]);

  useEffect(() => {
    async function compute() {
      if (chainId === constants.StarknetChainId.SN_MAIN) {
        const { data } = await fetchEthPrice();
        const usdeth = parseFloat(data.price.amount);
        const inputValue = parseFloat(debouncedValue);
        const cost = inputValue * usdeth;
        const dollarUSLocale = Intl.NumberFormat("en-US");
        setTransferAmountCost(
          `~$${dollarUSLocale.format(parseFloat(cost.toFixed(2)))}`,
        );
        return;
      }
    }

    function validateValue(): boolean {
      const inputValue = parseFloat(debouncedValue);
      const balance = parseFloat(ethBalance);
      if (inputValue > balance) {
        return false;
      }
      return true;
    }

    if (debouncing) {
      setTransferAmountCost(undefined);
      setTransferAmountInvalid(false);
      return;
    } else if (debouncedValue) {
      compute();
      const valid = validateValue();
      setTransferAmountInvalid(!valid);
    }
  }, [debouncing, debouncedValue, chainId, ethBalance]);

  if (transferHash) {
    return (
      <WagmiConfig config={ethereumConfig}>
        <TxnTracker chainId={chainId} ethTxnHash={transferHash} />
      </WagmiConfig>
    );
  }

  return (
    <WagmiConfig config={ethereumConfig}>
      <Banner Icon={EthereumDuoIcon} title="Bridge ETH" />

      <VStack w="full" align="start" spacing="18px">
        <Label>From</Label>
        <HStack w="full">
          <Box flexBasis="50%">
            <Menu variant="select" placement="bottom">
              <MenuButton
                as={SelectBox}
                leftIcon={<MetaMaskIcon />}
                rightIcon={!!ethAddress ? <CheckIcon /> : <WedgeDownIcon />}
                text={
                  !!ethAddress
                    ? ethAddress.substring(0, 3) +
                    "..." +
                    ethAddress.substring(ethAddress.length - 4)
                    : "Metamask"
                }
                pointerEvents={!!ethAddress ? "none" : "auto"}
              />
              <MenuList>
                <MenuItem>Metamask</MenuItem>
              </MenuList>
            </Menu>
          </Box>
          <ConnectButton
            onConnect={(ethAddress: string) => {
              setEthAddress(ethAddress);
            }}
            onDisconnect={() => {
              setEthAddress(undefined);
              setEthBalance(undefined);
              setTransferAmount(undefined);
              setTransferAmountCost(undefined);
            }}
          />
        </HStack>
        <HStack w="full">
          <Label>Transfer Amount</Label>

          <Spacer />

          <Label>
            Available{" "}
            <Text display="inline" pl={3} color="text.secondaryAccent">
              {ethBalance ? ethBalance + " ETH" : "---"}
            </Text>
          </Label>
        </HStack>

        <HStack
          position="relative"
          w="full"
          h="42px"
          spacing="0"
          borderRadius="4px"
          overflow="clip"
          opacity={!!ethAddress ? undefined : "0.4"}
          pointerEvents={!!ethAddress ? "auto" : "none"}
          _hover={!!ethAddress ? undefined : { cursor: "not-allowed" }}
        >
          <HStack
            w="full"
            h="full"
            bg="solid.primary"
            justify="center"
            flexBasis="54px"
          >
            <Circle size={4} bg="solid.secondary">
              <EthereumIcon />
            </Circle>
          </HStack>
          <Input
            h="full"
            type="number"
            flexGrow="1"
            placeholder="Enter amount"
            borderRadius="0"
            border="1px solid"
            borderColor="transparent"
            onChange={(event) => {
              setTransferAmount(event.target.value);
            }}
          />

          {transferAmountCost && (
            <Text position="absolute" right={2.5} fontSize="sm">
              {transferAmountCost}
            </Text>
          )}
        </HStack>
      </VStack>

      <Spacer />

      <Flex w="full" gap={2.5} direction="column">
        {errorMessage && !debouncing && (
          <Error
            error={{
              name: "Wallet error",
              message: errorMessage,
            }}
          />
        )}

        <TransferButton
          account={controller.account}
          value={transferAmount}
          disabled={
            !!!ethAddress ||
            !!!transferAmount ||
            transferAmountInvalid ||
            debouncing
          }
          onError={(error) => {
            if (error === null) {
              setErrorMessage(null);
              return;
            } else if (error.name === "ChainMismatchError") {
              const networkName =
                chainId === constants.StarknetChainId.SN_MAIN
                  ? "mainnet"
                  : "sepolia";
              setErrorMessage(
                `Please select the ${networkName} network in your wallet`,
              );
            } else {
              setErrorMessage(error.message);
            }
          }}
          onTxSubmitted={(hash) => {
            setTransferHash(hash);
          }}
        />
      </Flex>
    </WagmiConfig>
  );
}

const SelectBox = forwardRef<
  {
    leftIcon: React.ReactNode;
    rightIcon: React.ReactNode;
    text: string;
  },
  typeof HStack
>((props, ref) => (
  <HStack
    h="40px"
    px={3}
    py={4}
    borderBottom="1px solid"
    borderBottomColor="solid.accent"
    borderRadius="sm"
    transition="all 0.2s"
    _hover={{ cursor: "pointer", bg: "solid.accent" }}
    ref={ref}
  >
    {props.leftIcon}
    <Text fontSize="sm">{props.text}</Text>
    <Spacer />
    {props.rightIcon}
  </HStack>
));

const { chains, publicClient } = configureChains(
  [mainnet, sepolia],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ETH_RPC_MAINNET.replace(
        /^.+\/v2\//,
        "$`",
      ),
    }),
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ETH_RPC_SEPOLIA.replace(
        /^.+\/v2\//,
        "$`",
      ),
    }),
  ],
);

const ethereumConfig = createConfig({
  publicClient,
  connectors: [
    new MetaMaskConnector({
      chains,
    }),
  ],
});

async function fetchEthPrice() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: `{"query":"query { price(quote: ETH, base: USD) { amount }}"}`,
  });
  return res.json();
}
