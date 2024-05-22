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
  Image,
  Center,
} from "@chakra-ui/react";
import { constants } from "starknet";
import { ArrowLeftIcon, CartridgeColorIcon } from "@cartridge/ui";
// import { NetworkButton } from "./NetworkButton";
// import { EthBalance } from "./EthBalance";
// import { AccountMenu } from "./AccountMenu";
import { useController } from "hooks/controller";
import { useControllerTheme } from "hooks/theme";

export type HeaderProps = {
  chainId?: constants.StarknetChainId;
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

  if (!theme) {
    return null
  }

  if (!address || hideAccount) {
    return (
      <Container h="150px" position="relative">
        <VStack
          h="full"
          w="full"
          bg={`linear-gradient(to top, black, transparent), url('${theme.cover}')`}
          bgSize="cover"
          bgPos="center"
          position="relative"
        >
          <Center position="absolute" bottom={-8} left={0} right={0}>
            <Box bg="solid.bg" borderRadius="lg" p={2}>
              <Image src={theme.icon} boxSize={16} alt="Controller Icon" />
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
        ) :
          theme.id === "cartridge"
            ? <CartridgeColorIcon boxSize={8} />
            : <Image src={theme.icon} boxSize={8} alt="Controller Icon" />
        }

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
