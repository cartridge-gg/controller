import React, { useMemo } from "react";
import {
  Flex,
  Spacer,
  HStack,
  Container as ChakraContainer,
  StyleProps,
  IconButton,
  VStack,
  Image,
  Center,
  useColorMode,
} from "@chakra-ui/react";
import { ArrowLeftIcon, CartridgeColorIcon } from "@cartridge/ui";
// import { NetworkButton } from "./NetworkButton";
// import { EthBalance } from "./EthBalance";
// import { AccountMenu } from "./AccountMenu";
import { useController } from "hooks/controller";
import { useControllerTheme } from "hooks/theme";

export type HeaderProps = {
  chainId?: string;
  onLogout?: () => void;
  onBack?: () => void;
  hideAccount?: boolean;
};

export function Header({
  // chainId,
  // onLogout,
  onBack,
  hideAccount,
}: HeaderProps) {
  const [controller] = useController();
  const address = useMemo(() => controller?.address, [controller]);
  const theme = useControllerTheme();
  const { colorMode } = useColorMode();

  const cover = useMemo(
    () =>
      typeof theme.cover === "string" ? theme.cover : theme.cover[colorMode],
    [theme, colorMode],
  );

  if (!address || hideAccount) {
    return (
      <Container h={BANNER_HEIGHT} position="relative">
        <VStack
          h="full"
          w="full"
          bg={`url('${cover}')`}
          bgSize="cover"
          bgPos="center"
          position="relative"
        >
          <Center
            position="absolute"
            bottom={-ICON_OFFSET / 4}
            left={0}
            right={0}
          >
            <Flex
              bg="darkGray.700"
              borderRadius="lg"
              h={`${ICON_SIZE}px`}
              w={`${ICON_SIZE}px`}
              justify="center"
              alignItems="center"
              borderWidth={4}
              borderColor="solid.bg"
            >
              <Image
                src={theme.icon}
                boxSize={ICON_IMAGE_SIZE / 4}
                alt="Controller Icon"
              />
            </Flex>
          </Center>
        </VStack>
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
        ) : theme.id === "cartridge" ? (
          <CartridgeColorIcon boxSize={8} />
        ) : (
          <Image src={theme.icon} boxSize={8} alt="Controller Icon" />
        )}

        <Spacer />

        {/* <NetworkButton chainId={chainId} /> */}
        {/* <EthBalance chainId={chainId} address={address} /> */}

        {/* {chainId && <AccountMenu onLogout={onLogout} address={address} />} */}
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
    <Flex
      h={h}
      w="full"
      top="0"
      left="0"
      // position="fixed"
      zIndex="overlay"
      align="center"
      justify="center"
      flexShrink={0}
      borderBottomWidth={1}
      borderBottomColor="solid.spacer"
      bg="solid.bg"
      {...rest}
    >
      <ChakraContainer p={0} h="full" centerContent>
        {children}
      </ChakraContainer>
    </Flex>
  );
}

export const BANNER_HEIGHT = 150;
export const ICON_IMAGE_SIZE = 64;
export const ICON_SIZE = 80;
export const ICON_OFFSET = 32;
