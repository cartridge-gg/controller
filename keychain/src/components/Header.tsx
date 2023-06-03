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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import { Logo } from "@cartridge/ui/src/components/brand/Logo";
import { WordLogo } from "@cartridge/ui/src/components/brand/Word";
import TimesIcon from "@cartridge/ui/src/components/icons/Times";
import { HeaderItem } from "@cartridge/ui/src/components/HeaderItem";
import { useAvatar } from "../hooks/avatar";
import { Loading } from "./Loading";
import Chain from "@cartridge/ui/src/components/menu/Chain";
import { constants, SequencerProvider, uint256 } from "starknet";
import { useBalanceQuery } from "../generated/graphql";
import {
  CONTRACT_ETH,
  CONTRACT_POINTS,
} from "@cartridge/controller/src/constants";
import { BigNumber, utils } from "ethers";
import Ether from "./icons/Ether";
import ArrowIcon from "@cartridge/ui/components/icons/Arrow";
import Chevron from "@cartridge/ui/components/icons/Chevron";
import Copy from "@cartridge/ui/components/icons/Copy";
import Logout from "./icons/Logout";
import Wallet from "./icons/Wallet";

const Container = ({
  h,
  children,
  ...rest
}: {
  children: React.ReactNode;
} & StyleProps) => (
  <>
    <Flex
      h={h}
      w="full"
      top="0"
      left="0"
      position="fixed"
      zIndex="overlay"
      align="center"
      justify="center"
      flexShrink={0}
      bg="legacy.gray.800"
      {...rest}
    >
      <ChakraContainer centerContent>{children}</ChakraContainer>
    </Flex>
    <Box h={h} />
  </>
);

export const Header = ({
  chainId,
  address,
  muted = false,
  onLogout,
  onClose,
  onBack,
}: {
  chainId?: constants.StarknetChainId;
  address?: string;
  muted?: boolean;
  onLogout?: () => void;
  onClose?: () => void;
  onBack?: () => void;
}) => {
  const [ethBalance, setEthBalance] = useState<string>();

  const pointsChain = "starknet:SN_GOERLI";
  const pointsTokenAccountId = `${pointsChain}/${pointsChain}:${address || ""
    }/erc20:${CONTRACT_POINTS}`;
  const { data: pointsData, error: pointsError } = useBalanceQuery({
    tokenAccountId: pointsTokenAccountId,
  });
  const points = pointsData?.balance?.balance;
  const { current, loading } = useAvatar(address || "", points || 10);

  useEffect(() => {
    if (address) {
      const provider = new SequencerProvider({
        network:
          chainId === constants.StarknetChainId.MAINNET
            ? "mainnet-alpha"
            : "goerli-alpha",
      });

      provider
        .callContract({
          contractAddress: CONTRACT_ETH,
          entrypoint: "balanceOf",
          calldata: [BigNumber.from(address).toString()],
        })
        .then((res) => {
          setEthBalance(
            utils.formatEther(
              uint256
                .uint256ToBN({
                  low: res.result[0],
                  high: res.result[1],
                })
                .toString(),
            ),
          );
        });
    }
  }, [address, chainId]);

  if (!address) {
    const fill = muted ? "legacy.gray.200" : "brand";

    return (
      <Container h={12} bgColor="legacy.gray.700">
        <HStack w="full" justify="space-between">
          <Spacer maxW="42px" />
          <HStack spacing="0">
            <Logo fill={fill} w="24px" mr="15px" />
            <WordLogo fill={fill} h="18px" />
          </HStack>
          <Button
            h="30px"
            w="42px"
            variant="legacySecondary450"
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
    <Container height="50px" bgColor="legacy.gray.700">
      <HStack w="full" h="full" position="relative">
        {onBack ? (
          <HStack
            w="30px"
            h="30px"
            spacing="0"
            justify="center"
            onClick={onBack}
            data-group
            _hover={{
              cursor: "pointer",
            }}
          >
            <ArrowIcon
              fill="legacy.whiteAlpha.700"
              transform="rotate(180deg)"
              _groupHover={{
                fill: "white",
              }}
            />
          </HStack>
        ) : (
          <Logo fill="brand" w="24px" mr="15px" />
        )}
        <Spacer />
        <HStack spacing="6px">
          <Chain name={chainName} />
          <Box minW="70px">
            <HeaderItem>
              <Ether w="12px" h="12px" />
              {!!ethBalance && (
                <Text fontWeight="700" letterSpacing="0.05em">
                  {parseFloat(ethBalance).toFixed(3)}
                </Text>
              )}
              {!ethBalance && (
                <Loading fill="white" width="12px" height="12px" />
              )}
            </HeaderItem>
          </Box>
          {chainId && (
            <Menu>
              <MenuButton
                p="6px 12px"
                borderRadius="6px"
                bgColor="legacy.gray.600"
                _hover={{
                  bgColor: "legacy.gray.500",
                }}
              >
                <HStack spacing="8px">
                  <Box
                    w="18px"
                    h="18px"
                    dangerouslySetInnerHTML={
                      !!current?.svg ? { __html: current?.svg } : undefined
                    }
                  />
                  <Chevron direction="down" boxSize="8px" color="legacy.gray.300" />
                </HStack>
              </MenuButton>
              <MenuList position="absolute" top="12px" left="-130px">
                <MenuItem
                  color="legacy.whiteAlpha.800"
                  icon={<Wallet boxSize="16px" />}
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                  }}
                >
                  <HStack>
                    <Text color="currentColor" fontWeight="400">
                      {`${address?.slice(0, 3)}...${address?.slice(
                        address.length - 4,
                        address.length,
                      )}`}
                    </Text>
                    <Spacer />
                    <Copy />
                  </HStack>
                </MenuItem>
                <MenuItem
                  color="legacy.whiteAlpha.800"
                  icon={<Logout boxSize="16px" />}
                  onClick={onLogout}
                >
                  <Text color="currentColor" fontWeight="400">
                    Log Out
                  </Text>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
          <HStack
            w="24px"
            h="30px"
            justify="end"
            visibility={!!onClose ? "visible" : "hidden"}
            data-group
            _hover={{
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            <TimesIcon
              boxSize="18px"
              fill="legacy.whiteAlpha.700"
              _groupHover={{
                fill: "white",
              }}
            />
          </HStack>
        </HStack>
      </HStack>
    </Container>
  );
};

export const SignupHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Container h="64px" bgColor="legacy.gray.700">
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
