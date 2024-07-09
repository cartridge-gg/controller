import { CopyIcon } from "@cartridge/ui";
import { HStack, Text } from "@chakra-ui/react";
import { formatAddress } from "utils/contracts";
import { useCopyAndToast } from "./Toaster";

export function CopyAddress({ address }: { address: string }) {
  const copyAndToast = useCopyAndToast();

  return (
    <HStack
      onClick={() => {
        copyAndToast(formatAddress(address));
      }}
    >
      <Text color="text.secondaryAccent">
        {formatAddress(address, { first: 20, last: 10 })}
      </Text>
      <CopyIcon />
    </HStack>
  );
}
