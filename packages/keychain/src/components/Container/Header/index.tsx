import React, { useMemo } from "react";
import {
  Flex,
  Spacer,
  HStack,
  Container as ChakraContainer,
  StyleProps,
  IconButton,
  VStack,
  Box,
  Text,
  Image,
  Center,
  // useColorMode,
} from "@chakra-ui/react";
import { constants } from "starknet";
import { ArrowLeftIcon, CartridgeColorIcon } from "@cartridge/ui";
// import { NetworkButton } from "./NetworkButton";
// import { EthBalance } from "./EthBalance";
import { AccountMenu } from "./AccountMenu";
import { useController } from "hooks/controller";
// import { useRouter } from "next/router";

export type HeaderProps = {
  chainId?: constants.StarknetChainId;
  onLogout?: () => void;
  onBack?: () => void;
  hideAccount?: boolean;
};

export function Header({
  chainId,
  onLogout,
  onBack,
  hideAccount,
}: HeaderProps) {
  const [controller] = useController();
  const address = useMemo(() => controller?.address, [controller]);

  // const router = useRouter();
  // const { colorMode } = useColorMode();
  // const icon = useMemo(() => {
  //   const { icon: val } = router.query;
  //   if (typeof val === "undefined") return

  //   const str = decodeURIComponent(Array.isArray(val) ? val[val.length - 1] : val)

  //   let icon: string;
  //   try {
  //     const _icon = JSON.parse(str);
  //     icon = typeof _icon === "string" ? _icon : _icon[colorMode]
  //   } catch (e) {
  //     console.error(e)
  //     icon = str
  //   }
  //   return icon
  // }, [router.query, colorMode])

  if (!address || hideAccount) {
    return (
      <Container h="150px" position="relative">
        <VStack
          h="full"
          w="full"
          bg="linear-gradient(to top, black, transparent), url('whitelabel/ryo/cover.png')"
          bgSize="cover"
          bgPos="center"
          position="relative"
        >
          <Center position="absolute" bottom="-32px" left="0" right="0">
            <Box bg="solid.bg" borderRadius="lg" p="2">
              <Image src="/whitelabel/ryo/icon.png" boxSize="64px" />
            </Box>
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
        ) : (
          <CartridgeColorIcon boxSize={8} />
        )}

        <Spacer />

        {/* <NetworkButton chainId={chainId} /> */}
        {/* <EthBalance chainId={chainId} address={address} /> */}

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
