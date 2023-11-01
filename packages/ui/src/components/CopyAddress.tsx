import { Button, HStack, UseToastOptions, useToast } from "@chakra-ui/react";
import { DEFAULT_TOAST_OPTIONS } from "./CopyText";
import { useCallback, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";
import { truncateHash } from "../utils";

export function CopyAddress({
  address,
  toastOptions = DEFAULT_TOAST_OPTIONS,
}: {
  address: string;
  toastOptions?: UseToastOptions;
}) {
  const toast = useToast(toastOptions);
  const [isCopied, setIsCopied] = useState(false);

  const onCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast();
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, toastOptions.duration ?? 2000);
    } catch (e) {
      setIsCopied(false);
    }
  }, [address, toast, toastOptions.duration]);

  return (
    <HStack>
      <Button
        fontSize="sm"
        variant="round"
        rightIcon={isCopied ? <CheckIcon /> : <CopyIcon />}
        onClick={onCopyAddress}
      >
        {truncateHash(address)}
      </Button>
    </HStack>
  );
}
