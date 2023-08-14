import { IconButton, VStack, useDisclosure } from "@chakra-ui/react";
import { TransactionSummary } from "./TransactionSummary";
import { WedgeUpIcon } from "@cartridge/ui";
import { Policy } from "@cartridge/controller";

export function PortalFooter({
  children,
  origin,
  policies,
}: {
  children: React.ReactElement;
  origin?: string;
  policies?: Policy[];
}) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <VStack
      w="full"
      align="flex-start"
      position="fixed"
      bottom={0}
      left={0}
      borderTopWidth={1}
      bg="solid.bg"
      h={isOpen ? 484 : PORTAL_FOOTER_MIN_HEIGHT}
      transition="0.20s ease-out"
      paddingTop={4}
    >
      <IconButton
        aria-label="Expand footer"
        icon={
          <WedgeUpIcon
            boxSize={10}
            transform={isOpen ? "rotate(180deg)" : undefined}
            transition="0.20s ease-out"
            color="text.secondary"
          />
        }
        size="lg"
        position="absolute"
        left="calc(50% - 48px / 2)"
        top={-5}
        variant="round"
        bg="solid.bg"
        borderTopWidth={1}
        onClick={onToggle}
      />

      {origin && (
        <TransactionSummary
          isOpen={isOpen}
          origin={origin}
          policies={policies}
        />
      )}

      {children}
    </VStack>
  );
}

export const PORTAL_FOOTER_MIN_HEIGHT = 212;
