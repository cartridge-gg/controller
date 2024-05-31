import {
  Container as ChakraContainer,
  VStack,
  StyleProps,
  Flex,
  Show,
  HStack,
  Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Header, HeaderProps } from "./Header";
import { constants } from "starknet";
import { CartridgeIcon } from "@cartridge/ui";

export function Container({
  children,
  chainId = constants.StarknetChainId.SN_SEPOLIA,
  onBack,
  hideAccount,
  ...rest
}: {
  children: ReactNode;
} & StyleProps &
  HeaderProps) {
  return (
    <Wrapper {...rest}>
      <Header chainId={chainId} onBack={onBack} hideAccount={hideAccount} />

      <VStack
        w="full"
        h="full"
        p={4}
        pt={12}
        overflowY="auto"
        css={{
          "::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
        }}
      >
        {children}
      </VStack>

      <HStack
        w="full"
        borderTopWidth={1}
        borderColor="solid.tertiary"
        color="text.secondary"
        alignItems="center"
        justify="center"
        minH={FOOTER_HEIGHT / 4}
        bottom={0}
        position="fixed"
      >
        <CartridgeIcon fontSize="sm" />
        <Text fontSize="xs" color="currentColor">
          Controller by Cartridge
        </Text>
      </HStack>
    </Wrapper>
  );
}

export const FOOTER_HEIGHT = 40;

function Wrapper({ children }: React.PropsWithChildren) {
  return (
    <>
      {/** Show as full page  */}
      <Show below="md">
        <ChakraContainer
          w="100vw"
          bg="solid.bg"
          p={0}
          as={motion.div}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          centerContent
        >
          {children}
        </ChakraContainer>
      </Show>

      {/** Show as modal  */}
      <Show above="md">
        <Flex w="100vw" m={0} p={0} alignItems="center">
          <ChakraContainer
            w="432px"
            bg="solid.bg"
            p={0}
            as={motion.div}
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            centerContent
            borderRadius="md"
            overflow="hidden"
            position="relative"
          >
            {children}
          </ChakraContainer>
        </Flex>
      </Show>
    </>
  );
}
