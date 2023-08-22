import React from "react";
import {
  Box,
  Flex,
  Spacer,
  HStack,
  Container as ChakraContainer,
  StyleProps,
  IconButton,
} from "@chakra-ui/react";
import { constants } from "starknet";
import { ArrowLeftIcon, CartridgeColorIcon, WordLogo } from "@cartridge/ui";
import { NetworkButton } from "./NetworkButton";
import { EthBalance } from "./EthBalance";
import { AccountMenu } from "./AccountMenu";

export type HeaderProps = {
  chainId?: constants.StarknetChainId;
  address?: string;
  onLogout?: () => void;
  onBack?: () => void;
};

export function Header({ chainId, address, onLogout, onBack }: HeaderProps) {
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
        {onBack ? (
          <IconButton
            h={8}
            size="sm"
            aria-label="Go back"
            icon={<ArrowLeftIcon />}
            onClick={onBack}
          />
        ) : (
          <CartridgeColorIcon boxSize={8} />
        )}

        <Spacer />

        <NetworkButton chainId={chainId} />
        <EthBalance chainId={chainId} address={address} />

        {chainId && <AccountMenu onLogout={onLogout} address={address} />}
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
