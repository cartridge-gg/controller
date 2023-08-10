import { Button, IconButton, VStack, useDisclosure } from "@chakra-ui/react";
import { TransactionSummary } from "./TransactionSummary";
import { WedgeUpIcon } from "@cartridge/ui";
import { FormAction } from "../types";

export function PortalFooter({ action }: { action: FormAction }) {
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
      // TODO: should calculate based on the height of iframe
      h={isOpen ? 478 : PORTAL_FOOTER_MIN_HEIGHT}
      transition="0.20s ease-out"
    >
      <IconButton
        aria-label="Expand footer"
        icon={
          <WedgeUpIcon
            boxSize={10}
            transform={isOpen ? "rotate(180deg)" : undefined}
            transition="0.20s ease-out"
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

      <TransactionSummary isOpen={isOpen} />

      <VStack
        w="full"
        alignItems="flex"
        p={4}
        bg="solid.bg"
        position="fixed"
        bottom={0}
      >
        <Button
          type="submit"
          colorScheme="colorful"
          isDisabled={action !== "login"}
        >
          Log In
        </Button>
        <Button type="submit" isDisabled={action !== "signup"}>
          Sign Up
        </Button>
      </VStack>
    </VStack>
  );
}

export const PORTAL_FOOTER_MIN_HEIGHT = 200;
