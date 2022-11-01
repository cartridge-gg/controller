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

import { Logo } from "./brand/Logo";
import { WordLogo } from "./brand/Word";

export enum HeaderType {
  Arcade,
  Controller,
  Registration,
}

export type HeaderProps = {
  type?: HeaderType;
  address?: string;
  search?: React.ReactElement;
  registration?: React.ReactElement;
  notification?: React.ReactElement;
  showSocial?: boolean;
  onConnect?: () => void;
  onLogout?: () => void;
};

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

export const SimpleHeader = () => {
  return (
    <Container height="64px" borderBottom="1px solid" borderColor="gray.900">
      <Link href="/" variant="transparent">
        <Logo fill="brand" h="18px" m="12px" />
        <WordLogo h="18px" />
      </Link>
    </Container>
  );
};
