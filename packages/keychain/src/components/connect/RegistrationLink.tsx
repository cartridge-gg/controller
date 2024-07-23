import { Button, HStack, Text } from "@chakra-ui/react";

export function RegistrationLink({
  children,
  description,
  onClick,
}: {
  onClick: () => void;
  description: string;
} & React.PropsWithChildren) {
  return (
    <HStack justify="center" mt={3} gap={4}>
      <Text fontSize="sm" color="text.secondary">
        {description}
      </Text>

      <Button
        variant="gohst"
        onClick={onClick}
        textTransform="none"
        px={4}
        py={2}
        fontFamily="Inter"
        fontWeight="medium"
        color="link.blue"
        fontSize="xs"
        borderWidth={1}
        borderColor="solid.secondary"
      >
        {children}
      </Button>
    </HStack>
  );
}
