import { HStack, VStack, Text } from "@chakra-ui/react";
import { WebsiteIcon } from "@cartridge/ui";

export function TransactionSummary({
  isSlot,
  createSession,
  hostname,
}: {
  isSlot: boolean;
  createSession: boolean;
  hostname?: string;
}) {
  return (
    <VStack align="flex-start">
      {createSession && hostname && (
        <Summary>
          Create a session for{" "}
          <WebsiteIcon color="text.secondaryAccent" fontSize="sm" />
          <Text color="text.secondaryAccent" as="span" fontWeight="bold">
            {hostname}{" "}
          </Text>
          and allow the game to{" "}
          <Text color="text.secondaryAccent" as="span" fontWeight="bold">
            perform actions on your behalf
          </Text>
        </Summary>
      )}

      {isSlot && (
        <Summary title="Authorize Slot to manage your Cartridge infrastructure" />
      )}
    </VStack>
  );
}

export function Summary({
  title,
  children,
}: React.PropsWithChildren & {
  title?: string;
}) {
  return (
    <HStack align="flex-start" color="text.secondary" fontSize="xs">
      <Text color="text.secondary" fontSize="xs">
        {title || children}
      </Text>
    </HStack>
  );
}
