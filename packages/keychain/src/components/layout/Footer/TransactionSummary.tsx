import { HStack, VStack, Text, Link } from "@chakra-ui/react";
import { WebsiteIcon } from "@cartridge/ui";

export function TransactionSummary({
  isSlot,
  showTerm,
  createSession,
  hostname,
}: {
  isSlot: boolean;
  showTerm: boolean;
  createSession: boolean;
  hostname: string;
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

      {!!showTerm && (
        <Summary>
          <>
            By continuing you are agreeing to Cartridge&apos;s{" "}
            <Link
              textDecoration="underline"
              href="https://cartridgegg.notion.site/Cartridge-Terms-of-Use-a7e65445041449c1a75aed697b2f6e62"
              isExternal
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              textDecoration="underline"
              href="https://cartridgegg.notion.site/Cartridge-Privacy-Policy-747901652aa34c6fb354c7d91930d66c"
              isExternal
            >
              Privacy Policy
            </Link>
          </>
        </Summary>
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
