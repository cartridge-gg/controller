import { VStack, Circle, Text, IconProps } from "@chakra-ui/react";

export function PortalBanner({
  Icon,
  icon,
  title,
  description,
}: {
  Icon?: React.ComponentType<IconProps>;
  icon?: React.ReactElement;
  title: string;
  description?: string | React.ReactElement;
}) {
  return (
    <VStack w="full" mb={4} p={3}>
      <VStack pt={6} px={8}>
        {!!Icon && (
          <Circle size={12} mb={4} bg="solid.primary">
            <Icon boxSize={8} />
          </Circle>
        )}

        {!!icon && (
          <Circle size={12} mb={4} bg="solid.primary">
            {icon}
          </Circle>
        )}

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
