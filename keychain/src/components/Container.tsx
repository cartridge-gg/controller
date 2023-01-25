import { Flex, StyleProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { css } from "@emotion/react";

const Container = ({
  children,
  ...rest
}: { children: ReactNode } & StyleProps) => {
  return (
    <Flex
      p="36px"
      w={["full", "full", "400px"]}
      h="full"
      position="fixed"
      direction="column"
      align="center"
      as={motion.div}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      {...rest}
      css={css`
        overflow-y: auto;
        ::-webkit-scrollbar {
          display: none;
        }
        -ms-overflow-style: none;
      `}
    >
      {children}
    </Flex>
  );
};

export default Container;
