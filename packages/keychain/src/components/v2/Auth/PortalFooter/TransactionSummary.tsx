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
        <HStack color="text.secondary" fontSize="xs">
          {<JoystickSolidIcon boxSize={4} />}
          <Text color="text.secondary">Create a new Cartridge Controller</Text>
        </HStack>
      )}

      <HStack color="text.secondary" fontSize="xs">
        {<CodeIcon boxSize={4} />}
        <Text color="text.secondary">
          Create a session for{" "}
          <Text color="text.secondaryAccent" as="span" fontWeight="bold">
            {hostname}
          </Text>
        </Text>
      </HStack>

      <Terms />
    </VStack>
  );
}

function Terms() {
  return (
    <HStack align="flex-start">
      <LockIcon color="text.secondary" boxSize={4} />
      <Text fontSize="xs" color="text.secondary">
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
      </Text>
    </HStack>
  );
}

export type Summary = {
  desc: React.ReactElement | string;
  Icon: React.ComponentType<IconProps>;
};
