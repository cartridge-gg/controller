import { useState, useCallback } from "react";
import {
  Flex,
  Box,
  Text,
  Link,
  Circle,
  Spacer,
  HStack,
  VStack,
  Button,
  Tooltip,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ethers, utils } from "ethers";
import { Credentials, onCreateFinalize } from "hooks/account";
import { parseAttestationObject } from "utils/webauthn";
import { Loading } from "components/Loading";
import WalletIcon from "@cartridge/ui/src/components/icons/Wallet";
import GasPumpIcon from "@cartridge/ui/src/components/icons/GasPump";
import EthereumIcon from "@cartridge/ui/src/components/icons/Ethereum";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import ConnectIcon from "@cartridge/ui/src/components/icons/Connect";
import { formatAddress } from "utils/contracts";
import { register } from "methods/register";

export const BridgeEth = ({ amount }: { amount: string }) => {
  return (
    <VStack borderRadius="8px" overflow="hidden" spacing="1px">
      <HStack w="full" p="12px" bgColor="gray.700" color="whiteAlpha.600">
        <HStack fontSize="10px">
          <GasPumpIcon />
          <Text color="inherit" variant="ibm-upper-bold">
            Gas
          </Text>
        </HStack>
        <Spacer />
        <Text color="inherit" fontSize="11px">
          You keep 100% of this
        </Text>
      </HStack>
      <HStack
        w="full"
        p="12px"
        fontSize="14px"
        bgColor="gray.700"
        color="whiteAlpha.600"
      >
        <HStack color="inherit" w="full">
          <Circle size="24px" bgColor="gray.500">
            <EthereumIcon fill="green.400" boxSize="12px" />
          </Circle>
          <Text color="inherit">Bridge ETH</Text>
          <Tooltip
            placement="bottom"
            hasArrow
            label="Amount of your ETH being bridged"
            mt="10px"
          >
            <Link>
              <InfoIcon boxSize="14px" fill="whiteAlpha.500" />
            </Link>
          </Tooltip>
          <Spacer />
          <Text color="inherit">{amount && utils.formatEther(amount)}</Text>
        </HStack>
      </HStack>
    </VStack>
  );
};

export type L1ConnectProps = {
  username: string;
  credentials: Credentials;
};

export const L1Connect = ({ username, credentials }: L1ConnectProps) => {
  const [address, setAddress] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);

  const router = useRouter();
  const { ids } = router.query as { ids: Array<string> };

  const onConnect = async () => {
    if (address) {
      return setAddress(null);
    }
    setLoading(true);
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setLoading(false);
    setAddress(accounts[0]);
  };

  const onComplete = useCallback(async () => {
    setPending(true);
    try {
      // @ts-ignore
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      // force testnet for now
      if (network.name !== "goerli") {
        throw Error("goerli network required");
      }

      const {
        pub: { x, y },
      } = parseAttestationObject(credentials.response.attestationObject);

      const { deviceKey } = await register()(username, credentials.id, {
        x: x.toString(),
        y: y.toString(),
      });

      await onCreateFinalize(deviceKey, credentials);
      // router.push(
      //   `/signup/${ids[0]}/ethereum:${network.name.toUpperCase()}:${txL1.hash}`,
      // );
    } catch (e) {
      setError(e);
      console.error(e);
    } finally {
      setPending(false);
    }
  }, [username, credentials]);

  return (
    <Flex gap="20px" direction="column">
      <Flex borderRadius="8px" direction="column" gap="1px" overflow="hidden">
        <Flex bgColor="gray.600" p="12px">
          <Text variant="ibm-upper-bold" fontSize="10px" color="whiteAlpha.400">
            Funding Source
          </Text>
        </Flex>
        <Flex p="12px" gap="10px" bgColor="gray.700" direction="column">
          <HStack fontSize="14px">
            <WalletIcon fill="white" />
            <Text>Purchase on Ethereum mainnet</Text>
          </HStack>
          <Text color="whiteAlpha.600" fontSize="12px">
            {"You'll receive your starterpack on Starknet"}
          </Text>
          <Flex gap="10px">
            <HStack
              flex="1"
              px="10px"
              borderBottom="1px solid"
              borderColor="gray.600"
              fontSize="15px"
            >
              {address ? (
                <>
                  {loading ? (
                    <Loading fill="white" height="15px" width="15px" />
                  ) : (
                    <Text>{formatAddress(address)}</Text>
                  )}
                </>
              ) : (
                <Text>MetaMask</Text>
              )}
            </HStack>
            <Button
              variant="accent"
              minWidth="120px"
              onClick={onConnect}
              isDisabled={loading || pending}
            >
              {address ? "Disconnect" : "Connect"}
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Button
        w="full"
        gap="10px"
        onClick={onComplete}
        isLoading={pending}
        isDisabled={loading || !address}
      >
        <ConnectIcon /> Complete Transaction
      </Button>
    </Flex>
  );
};
