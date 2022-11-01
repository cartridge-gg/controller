import React from "react";
import {
  Box,
  Link,
  Flex,
  Button,
  Spacer,
  HStack,
  Container as ChakraContainer,
  useBreakpointValue,
  StyleProps,
} from "@chakra-ui/react";

import { Logo } from "../../../ui/src/components/brand/Logo";

import ChainDropdown from "../../../ui/src/components/menu/Chain";

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

export const Header = ({ address, onLogout }: {
  address?: string;
  onLogout?: () => void;
}) => {
  return (
    <Container height="64px">
      <HStack w="full">
        <HStack spacing="0">
          <Link href={process.env.NEXT_PUBLIC_SITE_URL}>
            <Logo fill="brand" w="24px" mr="15px" />
          </Link>
        </HStack>
        <Spacer />
        <HStack spacing="10px">
          <ChainDropdown />
        </HStack>
      </HStack>
    </Container >
  );
};
