import { StyleProps } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import { Card, Arrow } from "./Card";

export const Dialog = ({
  title,
  description,
  arrowPlacement,
  ...rest
}: {
  title?: string;
  description?: string;
  arrowPlacement?: string;
} & StyleProps) => {
  return (
    <Card
      px="70px"
      py="16px"
      bg="gray.700"
      align="center"
      position="relative"
      {...rest}
    >
      <Arrow color="gray.700" placement={arrowPlacement} />
      <Text as="strong" fontSize="15px">
        {title}
      </Text>
      <Text fontSize="13px" color="whiteAlpha.800">
        {description}
      </Text>
    </Card>
  );
};
