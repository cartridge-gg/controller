import { HStack, Text } from "@chakra-ui/react";
import { VerifiedIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useMemo } from "react";
import Link from "next/link";
import { isVerified } from "@cartridge/controller";

export function SessionConsent({
  variant = "default",
}: {
  variant?: "default" | "slot" | "signup";
}) {
  const { origin } = useConnection();
  const hostname = useMemo(
    () => (origin ? new URL(origin).hostname : undefined),
    [origin],
  );

  switch (variant) {
    case "slot":
      return (
        <HStack align="flex-start" color="text.secondary" fontSize="xs">
          <Text color="text.secondary" fontSize="xs" fontWeight="bold">
            Authorize Slot to manage your Cartridge infrastructure
          </Text>
        </HStack>
      );
    case "signup":
      return null;
    default:
    case "default":
      return hostname ? (
        <HStack color="text.secondary" fontSize="xs">
          {isVerified(origin) && (
            <Link
              href="https://github.com/cartridge-gg/controller/blob/main/packages/controller/src/presets.ts"
              target="_blank"
            >
              <VerifiedIcon
                fontSize="3xl"
                color="text.secondaryAccent"
                _hover={{ color: "brand.primary" }}
              />
            </Link>
          )}
          <Text color="text.secondary" fontSize="xs" fontWeight="bold">
            Authorize{" "}
            {/* <LockIcon fontSize="md" color="text.secondaryAccent" mr={0.5} /> */}
            <Text as="span" color="text.secondaryAccent" fontWeight="bold">
              {origin}
            </Text>{" "}
            to perform the following actions on your behalf
          </Text>
        </HStack>
      ) : null;
  }
}
