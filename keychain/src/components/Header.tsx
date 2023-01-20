import React, { ReactNode } from "react";
import NextLink from "next/link";
import {
  Box,
  Link,
  Flex,
  Spacer,
  HStack,
  Container as ChakraContainer,
  StyleProps,
} from "@chakra-ui/react";

import { Logo } from "@cartridge/ui/src/components/brand/Logo";
import { WordLogo } from "@cartridge/ui/src/components/brand/Word";
import ChainDropdown from "@cartridge/ui/src/components/menu/Chain";

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

export const Header = ({
  address,
  muted = false,
  onLogout,
}: {
  address?: string;
  muted?: boolean;
  onLogout?: () => void;
}) => {
  if (!address) {
    const fill = muted ? "gray.200" : "brand";
    const background = muted
      ? {
          bgColor: "gray.400",
          borderBottom: "1px solid",
          borderColor: "gray.600",
        }
      : {};
    return (
      <Container height="50px" {...background}>
        <HStack spacing="0">
          <Logo fill={fill} w="24px" mr="15px" />
          <WordLogo fill={fill} h="18px" />
        </HStack>
      </Container>
    );
  }

  return (
    <Container height="50px">
      <HStack w="full">
        <HStack spacing="0">
          <Logo fill="brand" w="24px" mr="15px" />
        </HStack>
        <Spacer />
        <HStack spacing="10px">
          <ChainDropdown />
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
