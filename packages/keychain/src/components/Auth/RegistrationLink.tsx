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
    <HStack justify="center" mt={3}>
      <Text fontSize="sm" color="text.secondary">
        {description}
      </Text>

      <Button variant="link" onClick={onClick}>
        {children}
      </Button>
    </HStack>
  );
}
