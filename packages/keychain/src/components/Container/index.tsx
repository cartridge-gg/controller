import {
  Container as ChakraContainer,
  VStack,
  StyleProps,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Show,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Header, HeaderProps } from "./Header";

export function Container({
  children,
  chainId,
  address,
  onBack,
  ...rest
}: {
  children: ReactNode;
} & StyleProps &
  HeaderProps) {
  return (
    <Wrapper {...rest}>
      <Header chainId={chainId} address={address} onBack={onBack} />
      <VStack
        w="full"
        h="full"
        p={4}
        overflowY="scroll"
        css={{
          "::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
        }}
      >
        {children}
      </VStack>
    </Wrapper>
  );
}

function Wrapper({ children }: React.PropsWithChildren) {
  return (
    <>
      {/** Show as full page  */}
      <Show below="md">
        <ChakraContainer
          w="100vw"
          h="100vh"
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
        <Flex w="100vw" h="100vh" m={0} p={0} alignItems="center">
          <ChakraContainer
            w="432px"
            h="600px"
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
