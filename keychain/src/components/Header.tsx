import React, { ReactNode, useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Link,
  Flex,
  Button,
  Spacer,
  HStack,
  Text,
  Container as ChakraContainer,
  StyleProps,
} from "@chakra-ui/react";

import { Logo } from "@cartridge/ui/src/components/brand/Logo";
import { WordLogo } from "@cartridge/ui/src/components/brand/Word";
import TimesIcon from "@cartridge/ui/src/components/icons/Times";
import { useAvatar } from "../hooks/avatar";
import { Loading } from "./Loading";
import Chain from "@cartridge/ui/src/components/menu/Chain";
import { constants, SequencerProvider, uint256 } from "starknet";
import { useBalanceQuery } from "../generated/graphql";
import { CONTRACT_ETH, CONTRACT_POINTS } from "@cartridge/controller/src/constants";
import { BigNumber, utils } from "ethers";
import Ether from "./icons/Ether";

const Container = ({
  height,
  children,
  ...rest
}: {
  height: string;
  children: React.ReactNode;
} & StyleProps) => (
  <>
    <Flex
      h={height}
      w="full"
      top="0"
      left="0"
      position="fixed"
      zIndex="overlay"
      align="center"
      justify="center"
      flexShrink={0}
      bg="gray.800"
      {...rest}
    >
      <ChakraContainer centerContent>{children}</ChakraContainer>
    </Flex>
    <Box h={height} />
  </>
);

export const HeaderItem = ({
  bgColor = undefined,
  children,
}: {
  bgColor?: string;
  children: React.ReactNode;
}) => {
  return (
    <HStack
      p="6px 18px"
      justify="center"
      fontSize="10px"
      lineHeight="18px"
      minHeight="30px"
      bgColor="gray.600"
      borderRadius="6px"
      userSelect="none"
      _hover={{
        bgColor: bgColor,
      }}
    >
      {children}
    </HStack>
  );
};

export const Header = ({
  chainId,
  address,
  muted = false,
  onLogout,
  onClose,
}: {
  chainId?: constants.StarknetChainId;
  address?: string;
  muted?: boolean;
  onLogout?: () => void;
  onClose?: () => void;
}) => {
  const [ethBalance, setEthBalance] = useState<string>();

  const pointsChain = "starknet:SN_GOERLI";
  const pointsTokenAccountId = `${pointsChain}/${pointsChain}:${address || ""}/erc20:${CONTRACT_POINTS}`;
  const { data: pointsData, error: pointsError } = useBalanceQuery({
    tokenAccountId: pointsTokenAccountId,
  });
  const points = pointsData?.balance?.balance;
  const { current, loading } = useAvatar(address || "", points || 10);

  useEffect(() => {
    const provider = new SequencerProvider({
      network: chainId === constants.StarknetChainId.MAINNET
        ? "mainnet-alpha"
        : "goerli-alpha",
    });

    provider.callContract({
      contractAddress: CONTRACT_ETH,
      entrypoint: "balanceOf",
      calldata: [BigNumber.from(address).toString()],
    }).then((res) => {
      setEthBalance(
        utils.formatEther(uint256.uint256ToBN({
          low: res.result[0],
          high: res.result[1],
        }).toString())
      );
    });
  }, [address, chainId]);

  if (!address) {
    const fill = muted ? "gray.200" : "brand";

    return (
      <Container height="54px">
        <HStack w="full" justify="space-between">
          <Spacer maxW="42px" />
          <HStack spacing="0">
            <Logo fill={fill} w="24px" mr="15px" />
            <WordLogo fill={fill} h="18px" />
          </HStack>
          <Button
            h="30px"
            w="42px"
            variant="secondary450"
            visibility={!!onClose ? "visible" : "hidden"}
            onClick={onClose}
          >
            <TimesIcon boxSize="18px" />
          </Button>
        </HStack>
      </Container>
    );
  }

  let chainName = "Unknown";
  switch (chainId) {
    case constants.StarknetChainId.MAINNET:
      chainName = "Mainnet";
      break;
    case constants.StarknetChainId.TESTNET:
      chainName = "Testnet";
      break;
    case constants.StarknetChainId.TESTNET2:
      chainName = "Testnet 2";
      break;
  }

  return (
    <Container height="50px">
      <HStack w="full">
        <HStack spacing="0">
          <Logo fill="brand" w="24px" mr="15px" />
        </HStack>
        <Spacer />
        <HStack spacing="10px">
          <Chain name={chainName} />
          <Box minW="90px">
            <HeaderItem>
              <Ether w="12px" h="12px" />
              {!!ethBalance && <Text>{parseFloat(ethBalance).toFixed(4)}</Text>}
              {!ethBalance && <Loading fill="white" width="12px" height="12px" />}
            </HeaderItem>
          </Box>
          {chainId && (
            <Box
              onClick={() => {
                navigator.clipboard.writeText(address);
              }}
              _hover={{
                cursor: "pointer",
              }}
            >
              <HeaderItem bgColor="gray.500">
                {loading ? (
                  <Loading fill="white" width="12px" height="12px" />
                ) : (
                  <Box
                    w="18px"
                    h="18px"
                    dangerouslySetInnerHTML={
                      !!current?.svg ? { __html: current?.svg } : undefined
                    }
                  />
                )}
              </HeaderItem>
            </Box>
          )}
          <Button
            h="30px"
            w="42px"
            variant="secondary450"
            bgColor="gray.600"
            visibility={!!onClose ? "visible" : "hidden"}
            onClick={onClose}
          >
            <TimesIcon boxSize="18px" />
          </Button>
        </HStack>
      </HStack>
    </Container>
  );
};

export const SignupHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Container height="64px">
      <HStack w="full" h="64px">
        <NextLink href="/">
          <Link>
            <Logo fill="brand" w="24px" mx="15px" />
          </Link>
        </NextLink>
        <Spacer />
        {children}
        <Spacer />
        <HStack spacing="10px"></HStack>
      </HStack>
    </Container>
  );
};
