import { HStack, VStack, Text, Link } from "@chakra-ui/react";
import { CodeIcon, LockIcon } from "@cartridge/ui";

export function TransactionSummary({ isOpen }: { isOpen: boolean }) {
  return (
    <VStack
      align="flex-start"
      p={4}
      overflowY={isOpen ? "scroll" : "hidden"}
      css={{
        "::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
      }}
    >
      {/** TODO: use real session value */}
      <Session icon={<CodeIcon boxSize={4} />}>
        Create a session for RYO
      </Session>

      <Terms />
    </VStack>
  );
}

function Session({
  icon,
  children,
}: {
  icon: React.ReactElement;
  children: string;
}) {
  return (
    <HStack color="text.secondary" fontSize="xs">
      {icon}
      <Text color="text.secondary">{children}</Text>
    </HStack>
  );
}

function Terms() {
  return (
    <HStack align="flex-start">
      <LockIcon color="text.secondary" boxSize={4} />
      <Text fontSize="xs">
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
