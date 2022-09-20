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

import ChainDropdown from "./menu/Chain";
import MenuDropdown from "./menu/Menu";

import TwitterIcon from "./icons/Twitter";
import DiscordIcon from "./icons/Discord";

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

function parse(type: HeaderType) {
  switch (type) {
    case HeaderType.Arcade:
      return {
        title: "Arcade",
        // link: "https://controller.cartridge.gg",
      };
    case HeaderType.Controller:
      return {
        title: "Controller",
        link: "https://cartridge.gg/",
      };
    case HeaderType.Registration:
      return {};
  }
}

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
  type = HeaderType.Controller,
  address,
  search,
  registration,
  notification,
  showSocial = false,
  onConnect,
  onLogout,
}: HeaderProps) => {
  const isMobile = useBreakpointValue([true, false]);
  const { title, link } = parse(type);
  return (
    <Container height="64px">
      {type === HeaderType.Registration ? (
        registration
      ) : (
        <HStack w="full">
          <HStack spacing="0">
            <Link href="https://cartridge.gg/">
              <Logo fill="brand" w="24px" mr="15px" />
            </Link>
            {!isMobile && (
              <Link href={link}>
                <Button
                  _before={{
                    w: "1px",
                    h: "20px",
                    left: "-1px",
                    content: "''",
                    display: "block",
                    position: "absolute",
                    background: "gray.600",
                  }}
                  variant="special"
                >
                  {title}
                </Button>
              </Link>
            )}
          </HStack>
          <Spacer />
          <HStack spacing="10px">
            {showSocial && !address && (
              <HStack spacing="20px">
                <Link href="https://twitter.com/cartridge_gg" isExternal>
                  <TwitterIcon color="brand" w="20px" h="20px" />
                </Link>
                <Link href="https://discord.gg/axTz7Zm4gk" isExternal>
                  <DiscordIcon color="brand" w="20px" h="20px" />
                </Link>
              </HStack>
            )}
            {!address ? (
              onConnect && <Button onClick={onConnect}>Connect</Button>
            ) : (
              <>
                {notification}
                {search}
                <ChainDropdown />
                <MenuDropdown
                  type={type}
                  address={address}
                  onLogout={onLogout}
                />
              </>
            )}
          </HStack>
        </HStack>
      )}
    </Container>
  );
};

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
