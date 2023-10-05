import { Box, Flex } from "@chakra-ui/react";
import { ReactElement } from "react";

export function FullPageAnimation({
  show,
  View,
}: {
  show: boolean;
  View: ReactElement;
}) {
  return (
    <Flex
      display={show ? "flex" : "none"}
      position="fixed"
      align="center"
      justify="center"
      top="0"
      left="0"
      h="100vh"
      w="100vw"
      bg="solid.bg"
      zIndex="overlay"
    >
      <Box w={["full", "full", "400px"]}>{View}</Box>
    </Flex>
  );
}
