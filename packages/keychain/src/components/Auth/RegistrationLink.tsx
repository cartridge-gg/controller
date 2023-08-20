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
    <HStack justify="center">
      <Text fontSize="sm" color="text.secondary" marginRight={3}>
        {description}
      </Text>

      <Button variant="link" onClick={onClick}>
        {children}
      </Button>
    </HStack>
  );
}
