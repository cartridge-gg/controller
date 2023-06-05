import React from "react";
import { Box } from "@chakra-ui/react";

const Bullet = (props: any) => {
  const { color, isLast, ...rest } = props;
  return (
    <Box position="relative" {...rest}>
      {!isLast && (
        <Box
          position="absolute"
          bottom="0"
          h="100%"
          w="1px"
          borderLeft={"1px solid"}
          borderColor={color}
        />
      )}
      <Box
        h="50%"
        w="32px"
        position="relative"
        borderBottom="1px solid"
        borderLeft="1px solid"
        borderColor={color}
        borderBottomLeftRadius="5px"
      >
        <Box
          position="absolute"
          bg={color}
          h="7px"
          w="7px"
          borderRadius="full"
          bottom="-4px"
          right="0"
        />
      </Box>
    </Box>
  );
};

export default Bullet;
