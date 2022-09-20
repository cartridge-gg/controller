import React from "react";
import {
  Text,
} from "@chakra-ui/react";

import { Card, Arrow } from "./Card";

export const Dialog = ({
  title,
  description,
  arrowPlacement,
}: {
  title?: string;
  description?: string
  arrowPlacement?: string
}) => {
  return (
    <Card
      px="70px"
      py="16px"
      bg="gray.700"
      align="center"
      position="relative"
    >
      <Arrow color="gray.700" placement={arrowPlacement} />
      <Text
        as="strong"
        variant="ld-mono-upper"
        color="brand"
        fontSize="15px"
      >
        {title}
      </Text>
      <Text fontSize="13px" color="whiteAlpha.800">
        {description}
      </Text>
    </Card>
  )
}