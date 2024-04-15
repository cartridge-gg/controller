import React, { useMemo } from "react";
import {
  Flex,
  Spacer,
  HStack,
  Container as ChakraContainer,
  StyleProps,
  IconButton,
} from "@chakra-ui/react";
import { constants } from "starknet";
import {
  ArrowLeftIcon,
  CartridgeColorIcon,
  CartridgeLogo,
} from "@cartridge/ui";
import { NetworkButton } from "./NetworkButton";
import { EthBalance } from "./EthBalance";
import { AccountMenu } from "./AccountMenu";
import { useController } from "hooks/controller";

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

  if (!address || hideAccount) {
    return (
      <Container h={12} p={1.5}>
        <CartridgeLogo boxSize={28} />
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
      <ChakraContainer p={0} centerContent>
        {children}
      </ChakraContainer>
    </Flex>
  );
}
