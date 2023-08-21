import { VStack, Circle, Text, IconProps } from "@chakra-ui/react";

export function PortalBanner({
  Icon,
  icon,
  title,
  description,
}: {
  icon?: React.ReactElement;
  Icon?: React.ComponentType<IconProps>;
  title: string;
  description?: string | React.ReactElement;
}) {
  return (
    <VStack w="full" marginBottom={4} p={3}>
      <VStack paddingTop={6} paddingX={8}>
        <Circle size={12} marginBottom={4} bg="solid.primary">
          {icon ? icon : <Icon boxSize={8} />}
        </Circle>

        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
        {description && (
          <Text fontSize="sm" color="text.secondary" align="center">
            {description}
          </Text>
        )}
      </VStack>
    </VStack>
  );
}
