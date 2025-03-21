import { ActivityDetail, cn, ExternalIcon } from "@/index";
import { formatAddress, isPublicChain, VoyagerUrl } from "@cartridge/utils";
import { cva, VariantProps } from "class-variance-authority";
import { addAddressPadding, constants } from "starknet";
import { ActivityDetails } from "../../activities/details";
import { Hex, hexToNumber } from "viem";

export interface CollectibleDetailsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleDetailsVariants> {
  address: string;
  tokenId: string;
  standard: string;
  chainId: constants.StarknetChainId;
}

const collectibleDetailsVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function CollectibleDetails({
  address,
  tokenId,
  standard,
  chainId,
  variant,
  className,
  ...props
}: CollectibleDetailsProps) {
  return (
    <ActivityDetails
      {...props}
      className={cn(collectibleDetailsVariants({ variant }), className)}
    >
      <ActivityDetail label="Contract Address">
        {isPublicChain(chainId) ? (
          <a
            href={VoyagerUrl(chainId).contract(address)}
            draggable={false}
            className="flex items-center gap-x-1.5 text-sm"
            target="_blank"
          >
            <div className="font-medium">
              {formatAddress(addAddressPadding(address), { size: "xs" })}
            </div>
            <ExternalIcon size="sm" />
          </a>
        ) : (
          <div>{formatAddress(addAddressPadding(address), { size: "sm" })}</div>
        )}
      </ActivityDetail>
      <ActivityDetail label="Token ID">
        {tokenId.startsWith("0x") ? hexToNumber(tokenId as Hex) : tokenId}
      </ActivityDetail>
      <ActivityDetail className="rounded-b" label="Token Standard">
        {standard}
      </ActivityDetail>
    </ActivityDetails>
  );
}

export default CollectibleDetails;
