import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  Link,
  HStack,
  Tooltip,
  Spacer,
  Collapse,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  StyleProps,
} from "@chakra-ui/react";
import { useConnectors, useAccount } from "@starknet-react/core";
import { hash, number } from "starknet";

import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import WalletIcon from "@cartridge/ui/src/components/icons/Wallet";
import ConnectIcon from "@cartridge/ui/src/components/icons/Connect";
import StarknetIcon from "@cartridge/ui/src/components/icons/Starknet";
import ArrowIcon from "@cartridge/ui/src/components/icons/Arrow";
import CopyIcon from "@cartridge/ui/src/components/icons/Copy";
import ArgentIcon from "@cartridge/ui/src/components/icons/Argent";
import ShareIcon from "@cartridge/ui/src/components/icons/Share";
import { Loading } from "components/Loading";
import { Logo } from "@cartridge/ui/src/components/icons/brand/Logo";
import { useRouter } from "next/router";
import { formatAddress } from "utils/contracts";
import { useAbi } from "hooks/abi";
import {
  CONTRACT_CONTROLLER_CLASS,
  CONTRACT_UPGRADE_IMPLEMENTATION,
} from "utils/constants";
import { Credentials, onCreateFinalize } from "hooks/account";
import { parseAttestationObject } from "utils/webauthn";
import { split } from "@cartridge/controller";
import provision from "methods/provision";
import { register } from "methods/register";

export type L2ConnectProps = {
  username: string;
  credentials: Credentials;
  allowArgent?: boolean;
  onComplete?: () => void;
};

export const L2Connect = ({
  username,
  credentials,
  allowArgent = true,
  onComplete,
}: L2ConnectProps) => {
  const router = useRouter();
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [txn, setTxn] = useState<string>();

  const { account, address } = useAccount();
  const { connect, disconnect, connectors } = useConnectors();
  const { abi, error: abiError, loading: abiLoading } = useAbi(address, true);

  const argent = connectors.find((connector) => connector.id() === "argentX");

  const isPluginSupported = useMemo(() => {
    return abi && !!abi.find((method) => method.name === "add_plugin");
  }, [abi]);

  const onConnect = async () => {
    if (address) {
      return disconnect();
    }
    connect(argent);
  };

  const onInstall = useCallback(async () => {
    setIsInstalling(true);

    const {
      pub: { x, y },
    } = parseAttestationObject(credentials.response.attestationObject);

    const { x: x0, y: x1, z: x2 } = split(x);
    const { x: y0, y: y1, z: y2 } = split(y);
    const deviceKey = await provision()(address, credentials.id);
    const { transaction_hash } = await account.execute([
      {
        contractAddress: address,
        entrypoint: "add_plugin",
        calldata: [CONTRACT_CONTROLLER_CLASS],
      },
      {
        contractAddress: address,
        entrypoint: "execute_on_plugin",
        calldata: [
          CONTRACT_CONTROLLER_CLASS,
          hash.getSelectorFromName("initialize"),
          "0x7",
          number.toHex(number.toBN(x0)),
          number.toHex(number.toBN(x1)),
          number.toHex(number.toBN(x2)),
          number.toHex(number.toBN(x2)),
          number.toHex(number.toBN(x2)),
          number.toHex(number.toBN(x2)),
          deviceKey,
        ],
      },
    ]);
    disconnect();
    setTxn(transaction_hash);
    await onCreateFinalize(deviceKey, credentials);
    onComplete ? onComplete() : router.push(`/profile/${address}`);
  }, [
    router,
    address,
    account,
    credentials,
    disconnect,
    setIsInstalling,
    setTxn,
    onComplete,
  ]);

  const onRegister = useCallback(async () => {
    setIsInstalling(true);
    const {
      pub: { x, y },
    } = parseAttestationObject(credentials.response.attestationObject);

    const { address, deviceKey } = await register()(username, credentials.id, {
      x: x.toString(),
      y: y.toString(),
    });

    await onCreateFinalize(deviceKey, credentials);
    onComplete ? onComplete() : router.push(`/profile/${address}`);
  }, [credentials, username, router, onComplete]);

  return (
    <Box borderRadius="8px" overflow="hidden">
      <HStack
        py="13px"
        px="16px"
        fontSize="11px"
        bgColor="gray.600"
        color="whiteAlpha.400"
      >
        <StarknetIcon />
        <Text color="inherit" variant="ibm-upper-bold">
          Already on Starknet?
        </Text>
      </HStack>
      {/* <Accordion variant="bridge" defaultIndex={argent ? [1] : [0]}> */}
      <Accordion variant="bridge" defaultIndex={0}>
        <AccordionItem isDisabled={isInstalling}>
          {({ isExpanded }) => (
            <>
              <AccordionButton
                gap="10px"
                fontSize="14px"
                color={isExpanded ? "white" : "gray.200"}
              >
                <Logo height="12px" /> {"I'm new to Starknet"}
                <Spacer />
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Text fontSize="12px" color="gray.300">
                  {"We'll get you setup with a fresh controller."}
                </Text>
                <Button
                  w="full"
                  mt="20px"
                  gap="10px"
                  isLoading={isInstalling}
                  onClick={() => onRegister()}
                >
                  {"Let's go!"} <ArrowIcon />
                </Button>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
        <AccordionItem isDisabled={!allowArgent || isInstalling}>
          {({ isExpanded }) => (
            <>
              <AccordionButton
                gap="10px"
                fontSize="14px"
                color={isExpanded ? "white" : "gray.200"}
              >
                <WalletIcon /> I have an Argent Wallet
                <Spacer />
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Flex direction="column" gap="15px">
                  {argent ? (
                    <>
                      <Text color="gray.300" fontSize="12px">
                        Argent is the primary wallet provider on Starknet
                      </Text>
                      <Flex gap="10px">
                        <HStack
                          flex="1"
                          px="10px"
                          justify={abiLoading && "center"}
                          borderBottom="1px solid"
                          borderColor="gray.600"
                          fontSize="15px"
                        >
                          {address ? (
                            <>
                              {abiLoading ? (
                                <Loading
                                  fill="white"
                                  height="15px"
                                  width="15px"
                                />
                              ) : (
                                <>
                                  <ArgentIcon
                                    height="15px"
                                    width="15px"
                                    color="whiteAlpha.400"
                                  />
                                  <Text>{formatAddress(address)}</Text>
                                  <Spacer />
                                  <Link
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(
                                        address,
                                      );
                                    }}
                                  >
                                    <CopyIcon color="whiteAlpha.400" />
                                  </Link>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <ArgentIcon
                                height="15px"
                                width="15px"
                                color="#FF875B"
                              />
                              <Text>{"Argent"}</Text>
                            </>
                          )}
                        </HStack>
                        <Button
                          variant="accent"
                          minWidth="120px"
                          disabled={abiLoading}
                          onClick={onConnect}
                          bgColor={address && "gray.700"}
                          _hover={{
                            bgColor: address && "gray.700",
                          }}
                          _disabled={{
                            cursor: "not-allowed",
                          }}
                        >
                          {address ? "Disconnect" : "Connect"}
                        </Button>
                      </Flex>
                      <Box>
                        <Collapse in={!!address && !!abi}>
                          <PluginInstall
                            isInstalling={isInstalling}
                            supported={isPluginSupported}
                            transaction={txn}
                            onInvoke={onInstall}
                            onComplete={onComplete}
                          />
                        </Collapse>
                      </Box>
                    </>
                  ) : (
                    <Text color="gray.400" fontSize="13px">
                      Argent wallet not detected
                    </Text>
                  )}
                </Flex>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

const InfoCard = ({
  children,
  ...rest
}: { children: ReactNode } & StyleProps) => {
  return (
    <Flex
      p="12px"
      gap="10px"
      align="center"
      borderRadius="4px"
      border="1px solid"
      borderColor="gray.600"
      {...rest}
    >
      {children}
    </Flex>
  );
};

const PluginInstall = ({
  isInstalling,
  supported,
  transaction,
  onInvoke,
  onComplete,
}: {
  isInstalling: boolean;
  supported: boolean;
  transaction: string;
  onInvoke: () => void;
  onComplete?: () => void;
}) => {
  const router = useRouter();
  const { account } = useAccount();
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!supported) {
    return (
      <InfoCard fontSize="13px" flexDirection="column">
        <Text color="gray.200">
          You must enable plugins on your Argent wallet
        </Text>
        <Button
          w="32"
          h="8"
          onClick={async () => {
            const { transaction_hash } = await account.execute([
              {
                contractAddress: account.address,
                entrypoint: "upgrade",
                calldata: [CONTRACT_UPGRADE_IMPLEMENTATION],
              },
            ]);

            setIsUpgrading(true);
          }}
          disabled={isUpgrading}
        >
          {isUpgrading ? <Loading fill="black" /> : "Enable"}
        </Button>
      </InfoCard>
    );
  }

  return (
    <>
      {isInstalling ? (
        <>
          <InfoCard flexDirection="row" fontSize="14px" color="gray.200">
            <Text fontSize="14px" color="inherit">
              Installation in progress
            </Text>
            <Spacer />
            <Tooltip
              hasArrow
              my="10px"
              label="Voyager transaction link"
              placement="bottom"
            >
              <Link
                isExternal
                href={`https://goerli.voyager.online/tx/${transaction}`}
              >
                <ShareIcon height="14px" width="14px" />
              </Link>
            </Tooltip>
          </InfoCard>
          <Button
            w="full"
            mt="15px"
            gap="10px"
            onClick={() => {
              onComplete
                ? onComplete()
                : router.push(`/profile/${account.address}`);
            }}
          >
            Lets go! <ArrowIcon />
          </Button>
        </>
      ) : (
        <Flex align="center">
          <Button
            variant="accent"
            flex="4"
            gap="10px"
            minWidth="120px"
            disabled={isInstalling}
            onClick={onInvoke}
          >
            <ConnectIcon />
            <Text color="inherit" variant="ld-mono-upper">
              INSTALL CONTROLLER
            </Text>
          </Button>
          <Flex flex="1" justify="center">
            <Tooltip
              placement="bottom"
              hasArrow
              label="Installs Cartridge Controller Plugin"
              my="10px"
            >
              <Link>
                <InfoIcon color="whiteAlpha.400" fontSize="13px" />
              </Link>
            </Tooltip>
          </Flex>
        </Flex>
      )}
    </>
  );
};
