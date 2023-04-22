import Chevron from "@cartridge/ui/components/icons/Chevron";
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
import { configureChains, fetchBalance } from "@wagmi/core";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";
import { Header } from "components/Header";
import Check from "components/icons/Check";
import EthereumLarge from "components/icons/EthereumLarge";
import MetaMask from "components/icons/Metamask";
import { useDebounce } from "hooks/debounce";
import { useEffect, useState } from "react";
import { constants } from "starknet";
import { createClient, goerli, mainnet, WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import ConnectButton from "./ConnectButton";
import TransferButton from "./TransferButton";
import Transactions from "./Transactions";
import Label from "components/Label";
import Controller from "utils/controller";
import { Error } from "components/Error";

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
    p="12px 14px"
    borderBottom="1px solid"
    borderBottomColor="gray.600"
    borderRadius="4px"
    transition="all 0.2s"
    _hover={{ cursor: "pointer", bgColor: "gray.700" }}
    ref={ref}
  >
    {props.leftIcon}
    <Text fontSize="14px">{props.text}</Text>
    <Spacer />
    {props.rightIcon}
  </HStack>
));

const { chains, provider } = configureChains(
  [mainnet, goerli],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ETH_RPC_MAINNET.replace(
        /^.+\/v2\//,
        "$`",
      ),
    }),
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ETH_RPC_GOERLI.replace(/^.+\/v2\//, "$`"),
    }),
  ],
);

const ethereumClient = createClient({
  provider,
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

const BridgeEth = ({
  chainId,
  controller,
  onBack,
  onClose,
  onLogout,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onBack: () => void;
  onClose: () => void;
  onLogout: () => void;
}) => {
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
            chainId === constants.StarknetChainId.MAINNET
              ? mainnet.id
              : goerli.id,
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
      if (chainId === constants.StarknetChainId.MAINNET) {
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
      <WagmiConfig client={ethereumClient}>
        <Header
          chainId={chainId}
          address={controller.address}
          onBack={onBack}
          onClose={onClose}
          onLogout={onLogout}
        />
        <Transactions
          address={controller.address}
          chainId={chainId}
          ethTxnHash={transferHash}
        />
      </WagmiConfig>
    );
  }

  return (
    <WagmiConfig client={ethereumClient}>
      <Header
        chainId={chainId}
        address={controller.address}
        onBack={onBack}
        onClose={onClose}
      />
      <HStack w="full" justify="flex-start" pb="20px" spacing="20px">
        <Circle bgColor="gray.700" size="48px">
          <EthereumLarge boxSize="30px" color="green.400" />
        </Circle>
        <Text fontSize="17px" fontWeight="bold">
          Bridge ETH
        </Text>
      </HStack>
      <VStack w="full" align="start" spacing="18px">
        <Label>From</Label>
        <HStack w="full">
          <Box flexBasis="50%">
            <Menu variant="select" placement="bottom">
              <MenuButton
                as={SelectBox}
                leftIcon={<MetaMask />}
                rightIcon={
                  !!ethAddress ? (
                    <Check color="whiteAlpha.400" />
                  ) : (
                    <Chevron
                      direction="down"
                      boxSize="7px"
                      color="whiteAlpha.400"
                    />
                  )
                }
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
          <Label color="gray.400">
            Available{" "}
            <Text display="inline" color="gray.200" pl="12px">
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
            bgColor="gray.600"
            justify="center"
            flexBasis="54px"
          >
            <Circle size="18px" bgColor="whiteAlpha.50">
              <EthereumLarge boxSize="18px" />
            </Circle>
          </HStack>
          <Input
            h="full"
            type="number"
            variant=""
            flexGrow="1"
            bgColor="gray.700"
            placeholder="Enter amount"
            fontFamily="IBM Plex Sans"
            fontSize="13px"
            lineHeight="18px"
            borderRadius="0"
            border="1px solid"
            borderColor="transparent"
            _focus={{ borderColor: "whiteAlpha.200" }}
            onChange={(event) => {
              setTransferAmount(event.target.value);
            }}
          />
          {transferAmountCost && (
            <Text
              position="absolute"
              right="10px"
              fontSize="13px"
              color="gray.200"
            >
              {transferAmountCost}
            </Text>
          )}
        </HStack>
      </VStack>
      <Spacer />
      <Flex w="full" gap="10px" direction="column">
        {errorMessage && !debouncing && <Error
          error={{
            name: "Wallet error",
            message: errorMessage,
          }}
        />}
        <TransferButton
          account={controller.account(chainId)}
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
                chainId === constants.StarknetChainId.MAINNET
                  ? "mainnet"
                  : "goerli";
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
};

export default BridgeEth;
