import { CopyIcon } from "@cartridge/ui";
import { HStack, Text } from "@chakra-ui/react";
import { formatAddress } from "@cartridge/utils";
import { useToast } from "hooks/toast";
import { addAddressPadding } from "starknet";

export function CopyAddress({ address }: { address: string }) {
  const { toast } = useToast();

  return (
    <HStack
      _hover={{ cursor: "pointer" }}
      onClick={() => {
        navigator.clipboard.writeText(addAddressPadding(address));
        toast("Copied");
      }}
    >
      <Text color="text.secondaryAccent">{formatAddress(address)}</Text>
      <CopyIcon fontSize="md" />
    </HStack>
  );
}
