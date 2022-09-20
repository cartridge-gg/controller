import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";

export function Triangle(props: any) {
  const bgColor = useColorModeValue("30px solid #fff", "30px solid #0F1410");

  return (
    <Box
      {...props}
      height={0}
      width={0}
      borderRight={bgColor}
      borderLeft={bgColor}
      borderBottom="15px solid transparent"
    ></Box>
  );
}

export default Triangle;
