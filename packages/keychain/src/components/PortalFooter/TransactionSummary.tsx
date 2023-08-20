import { HStack, VStack, Text, Link, IconProps } from "@chakra-ui/react";
import { CodeIcon, JoystickSolidIcon, LockIcon } from "@cartridge/ui";
import { useMemo } from "react";

export function TransactionSummary({
  origin,
  isSignup,
}: {
  origin: string;
  isSignup?: boolean;
}) {
  const hostname = useMemo(() => new URL(origin).hostname, [origin]);

  return (
    <VStack align="flex-start">
      {isSignup && (
        <Summary Icon={JoystickSolidIcon}>
          Create a new Cartridge Controller
        </Summary>
      )}

      <Summary Icon={CodeIcon}>
        Create a session for{" "}
        <Text color="text.secondaryAccent" as="span" fontWeight="bold">
          {hostname}
        </Text>
      </Summary>

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
    </VStack>
  );
}

function Summary({
  Icon,
  children,
}: React.PropsWithChildren & {
  Icon: React.ComponentType<IconProps>;
}) {
  return (
    <HStack align="flex-start" color="text.secondary" fontSize="xs">
      <Icon boxSize={4} />

      {}
      <Text color="text.secondary" fontSize="xs">
        {children}
      </Text>
    </HStack>
  );
}
