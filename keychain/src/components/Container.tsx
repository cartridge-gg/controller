import { Container as ChakraContainer, StyleProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { css } from "@emotion/react";

const Container = ({
  children,
  ...rest
}: { children: ReactNode } & StyleProps) => {
  return (
    <ChakraContainer
      css={css`
        overflow-y: auto;
        ::-webkit-scrollbar {
          display: none;
        }
        -ms-overflow-style: none;
      `}
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
};

export default Container;
