import { Text } from "@chakra-ui/react";

export function Label({
  color = "text.secondaryAccent",
  children,
}: {
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <Text
      fontSize="10px"
      fontWeight="bold"
      letterSpacing="0.08em"
      textTransform="uppercase"
      color={color}
    >
      {children}
    </Text>
  );
}
