import React from "react";
import {
  Box,
  Flex,
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
import { WordLogo } from "@cartridge/ui/src/components/brand/Word";
import { HeaderItem } from "@cartridge/ui/src/components/HeaderItem";
import Chain from "@cartridge/ui/src/components/menu/Chain";
import { constants } from "starknet";
import { Loading } from "components/Loading";
import Ether from "components/icons/Ether";
import {
  CartridgeColorIcon,
  CopyIcon,
  LogoutDuoIcon,
  WalletSolidIcon,
  WedgeDownIcon,
} from "@cartridge/ui";
import { useHeader } from "./hooks";
import { NetworkButton } from "./NetworkButton";

export type HeaderProps = {
  chainId?: constants.StarknetChainId;
  address?: string;
  onLogout?: () => void;
};

export function Header({
  chainId,
  address = "0x00000000",
  onLogout,
}: HeaderProps) {
  const { chainName, ethBalance, avatar } = useHeader({ chainId, address });

  if (!address) {
    return (
      <Container h={12} p={1.5}>
        <WordLogo h={4} color="brand.primary" />
      </Container>
    );
  }

  return (
    <Container h={12} p={2}>
      <HStack w="full">
        <CartridgeColorIcon boxSize={8} />

        <Spacer />

        <NetworkButton />

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
              {!ethBalance && <Loading width="12px" height="12px" />}
            </HeaderItem>
          </Box>
          {chainId && (
            <Menu>
              <MenuButton
                p="6px 12px"
                borderRadius="6px"
                bgColor="gray.600"
                _hover={{
                  bgColor: "gray.500",
                }}
              >
                <HStack spacing="8px">
                  <Box
                    w="18px"
                    h="18px"
                    dangerouslySetInnerHTML={
                      !!avatar?.svg ? { __html: avatar?.svg } : undefined
                    }
                  />
                  <WedgeDownIcon
                    direction="down"
                    boxSize="8px"
                    color="gray.300"
                  />
                </HStack>
              </MenuButton>
              <MenuList position="absolute" top="12px" left="-130px">
                <MenuItem
                  color="whiteAlpha.800"
                  icon={<WalletSolidIcon boxSize="16px" />}
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
                    <CopyIcon />
                  </HStack>
                </MenuItem>
                <MenuItem
                  color="whiteAlpha.800"
                  icon={<LogoutDuoIcon boxSize="16px" />}
                  onClick={onLogout}
                >
                  <Text color="currentColor" fontWeight="400">
                    Log Out
                  </Text>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </HStack>
    </Container>
  );
}

function Container({
  h,
  children,
  ...rest
}: {
  children: React.ReactNode;
} & StyleProps) {
  return (
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
        borderBottomWidth={1}
        borderBottomColor="solid.spacer"
        bg="solid.bg"
        {...rest}
      >
        <ChakraContainer p={0} centerContent>
          {children}
        </ChakraContainer>
      </Flex>
      <Box h={h} />
    </>
  );
}
