import { HStack } from "@chakra-ui/react";

export const HeaderItem = ({
  bgColor = undefined,
  children,
}: {
  bgColor?: string;
  children: React.ReactNode;
}) => {
  return (
    <HStack
      p="6px 12px"
      spacing="4px"
      justify="center"
      fontSize="10px"
      lineHeight="18px"
      minHeight="30px"
      bgColor="gray.600"
      borderRadius="6px"
      userSelect="none"
      _hover={{
        bgColor: bgColor,
      }}
    >
      {children}
    </HStack>
  );
};

export default HeaderItem;
