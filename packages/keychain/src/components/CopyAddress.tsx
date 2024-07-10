import { CopyIcon } from "@cartridge/ui";
import { HStack, Text } from "@chakra-ui/react";
import { formatAddress } from "utils/contracts";
import { useToast } from "hooks/toast";

export function CopyAddress({ address }: { address: string }) {
  const { toast } = useToast();

  return (
    <HStack
      _hover={{ cursor: "pointer" }}
      onClick={() => {
        navigator.clipboard.writeText(address);
        toast("Copied");
      }}
    >
      <Text color="text.secondaryAccent">
        {formatAddress(address, { first: 20, last: 10 })}
      </Text>
      <CopyIcon fontSize="md" />
    </HStack>
  );
}
