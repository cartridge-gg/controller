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
    <Wrapper>
      <ChakraContainer
        w="full"
        h="full"
        mt={[, , "auto"]}
        as={motion.div}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        centerContent
        p={0}
        {...rest}
      >
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
      </ChakraContainer>
    </Wrapper>
  );
}

function Wrapper({ children }: React.PropsWithChildren) {
  return (
    <>
      <Show below="md">
        <Flex h="100vh" w="100vw" alignItems="center">
          <ChakraContainer
            w={["full", "full", "432px"]}
            h={["full", "full", "600px"]}
            bg="solid.bg"
            p={0}
          >
            {children}
          </ChakraContainer>
        </Flex>
      </Show>

      <Show above="md">
        <Modal isOpen={true} onClose={() => {}} motionPreset="none">
          <ModalOverlay />

          <ModalContent>
            <ModalContent p={0} overflow="hidden">
              <ModalBody p={0}>{children}</ModalBody>
            </ModalContent>
          </ModalContent>
        </Modal>
      </Show>
    </>
  );
}
