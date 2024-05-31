import { HStack, VStack, Text, Link, IconProps } from "@chakra-ui/react";
import { LockIcon, WrenchIcon } from "@cartridge/ui";

export function TransactionSummary({
  isSlot,
  showTerm,
  hostname,
}: {
  isSignup?: boolean;
  isSlot?: boolean;
  showTerm?: boolean;
  hostname?: string;
}) {
  return (
    <VStack align="flex-start">
      {hostname && (
        <Summary>
          Create a session for <LockIcon color="text.secondaryAccent" />
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
        <Summary
          Icon={WrenchIcon}
          title="Authorize Slot to manage your Cartridge infrastructure"
        />
      )}

      {showTerm && (
        <Summary Icon={LockIcon}>
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
  Icon,
  title,
  children,
}: React.PropsWithChildren & {
  Icon?: React.ComponentType<IconProps>;
  title?: string;
}) {
  return (
    <HStack align="flex-start" color="text.secondary" fontSize="xs">
      {Icon && <Icon boxSize={4} />}

      <Text color="text.secondary" fontSize="xs">
        {title || children}
      </Text>
    </HStack>
  );
}
