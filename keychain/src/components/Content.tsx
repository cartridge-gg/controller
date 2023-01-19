import { VStack, StyleProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

const Content = ({
  children,
  ...rest
}: { children: ReactNode } & StyleProps) => {
  return (
    <VStack
      w={["full", "full", "400px"]}
      as={motion.div}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      {...rest}
    >
      {children}
    </VStack>
  );
};

export default Content;
