import { Text } from "@chakra-ui/react";

const Label = ({
  color = "gray.200",
  children,
}: {
  color?: string;
  children: React.ReactNode;
}) => (
  <Text
    fontSize="10px"
    fontWeight="700"
    lineHeight="16px"
    letterSpacing="0.08em"
    textTransform="uppercase"
    color={color}
  >
    {children}
  </Text>
);

export default Label;
