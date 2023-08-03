import React, { useState } from "react";
import { Box, Input as ChakraInput, InputProps } from "@chakra-ui/react";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

export const Input = (props: InputProps) => {
  return (
    <Box w="100%" position="relative">
      <ChakraInput
        variant="custom"
        {...props}
        css={css`
          :hover + div {
            border-color: #808080;
          }
          :focus + div {
            border-color: #fff;
          }
        `}
      />
      <Box
        h="10px"
        w="100%"
        position="absolute"
        borderRadius="0 0 4px 4px"
        borderBottom="2px solid"
        borderX="2px solid"
        borderColor="gray.500"
        bottom="0"
        transition="border-color 0.2s ease"
      ></Box>
    </Box>
  );
};
