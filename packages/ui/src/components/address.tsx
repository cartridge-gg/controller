import { formatAddress, FormatAddressOptions, cn } from "@/utils";
import { CopyIcon } from "./icons";
import { toast } from "sonner";
import { useCallback } from "react";
import { addAddressPadding } from "starknet";

type AddressProps = {
  address: string;
  className?: string;
  copyable?: boolean;
  monospace?: boolean;
  explorerUrl?: string;
} & FormatAddressOptions;

/**
 * A component for consistently rendering Starknet addresses across the application
 */
export function Address({
  address,
  className,
  size,
  first,
  last,
  copyable = false,
  monospace = true,
  explorerUrl,
}: AddressProps) {
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(addAddressPadding(address));
    toast.success("Address copied");
  }, [address]);

  const formattedAddress = formatAddress(address, { first, last, size });

  const content = copyable ? (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer",
        monospace && "font-mono",
        "text-primary",
        className,
      )}
      onClick={onCopy}
    >
      {formattedAddress}
      <CopyIcon size="xs" />
    </div>
  ) : (
    <span className={cn(monospace && "font-mono", "text-primary", className)}>
      {formattedAddress}
    </span>
  );

  if (explorerUrl) {
    return (
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
          copyable && e.preventDefault()
        }
      >
        {content}
      </a>
    );
  }

  return content;
}
