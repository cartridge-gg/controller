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
    <VStack pb={6}>
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

      <Text fontSize="lg" fontWeight="semibold" whiteSpace="nowrap">
        {title}
      </Text>

      {description && (
        <Text fontSize="sm" color="text.secondary" align="center">
          {description}
        </Text>
      )}
    </VStack>
  );
}
