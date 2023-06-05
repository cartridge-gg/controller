import { Box } from "@chakra-ui/react";
export const EdgeFade = ({ percentage = 5 }: { percentage?: number }) => (
  <>
    <Box
      h="full"
      w={`${percentage}%`}
      top="0"
      right="0"
      position="absolute"
      background="linear-gradient(to left, #1E221F, transparent)"
    />
    <Box
      h="full"
      w={`${percentage}%`}
      top="0"
      left="0"
      position="absolute"
      background="linear-gradient(to right, #1E221F, transparent)"
    />
  </>
);
