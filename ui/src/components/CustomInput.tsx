import React, { useState } from "react";
import {
  Box,
  Input as ChakraInput,
  InputRightElement,
  InputProps,
  InputGroup,
  Button,
} from "@chakra-ui/react";
import { css } from "@emotion/react";

import EyeSlash from "./icons/EyeSlash";
import Eye from "./icons/Eye";

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
        borderColor="legacy.gray.500"
        bottom="0"
        transition="border-color 0.2s ease"
      ></Box>
    </Box>
  );
};

export const PasswordInput = (props: InputProps) => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  return (
    <InputGroup size="md">
      <Input pr="4.5rem" type={show ? "text" : "password"} {...props} />
      <InputRightElement width="4.5rem">
        <Button
          h="1.5rem"
          size="sm"
          onClick={handleClick}
          variant="unstyled"
          color="#888"
        >
          {show ? <EyeSlash size="sm" /> : <Eye size="sm" />}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};
