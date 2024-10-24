import { VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useConnection } from "hooks/connection";
import { Policies } from "components/Policies";

export function SessionDetails() {
  const { policies } = useConnection();

  return (
    <VStack
      borderRadius="base"
      overflowY="auto"
      rowGap="0.1rem"
      minH="min-content"
      marginY={4}
      alignItems="flex"
      as={motion.div}
      // Setting the initial display to `none` prevents the
      // div from being visible on the first render
      // which otherwise would cause a 'bouncy' effect.
      display="none"
      animate={{
        display: "flex",
      }}
      zIndex={1}
    >
      <Policies title="Session Details" policies={policies} />
    </VStack>
  );
}
