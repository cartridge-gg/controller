import { HStack, Text, Link } from "@chakra-ui/react";
import { LockIcon } from "@cartridge/ui";

export const Legal = () => (
  <HStack spacing={2} align="flex-start" marginTop="auto" mb="0.5rem">
    <LockIcon color="#808080" width="16px" height="16px" />
    <Text fontSize="12px" fontWeight={500} lineHeight="16px" color="#808080">
      By continuing you are agreeing to Cartridge&apos;s{" "}
      <Link
        href="https://cartridge.gg/legal/terms-of-service"
        target="_blank"
        color="#808080"
        textDecoration="underline"
        display="inline"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="https://cartridge.gg/legal/privacy-policy"
        target="_blank"
        color="#808080"
        textDecoration="underline"
        display="inline"
      >
        Privacy Policy
      </Link>
    </Text>
  </HStack>
);
