import { Container as ChakraContainer, StyleProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Container({
  children,
  ...rest
}: { children: ReactNode } & StyleProps) {
  return (
    <ChakraContainer
      overflowY="auto"
      css={{
        "::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
      }}
      p="36px"
      w={["full", "full", "432px"]}
      h="full"
      position="fixed"
      as={motion.div}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      centerContent
      {...rest}
    >
      {children}
    </ChakraContainer>
  );
}
