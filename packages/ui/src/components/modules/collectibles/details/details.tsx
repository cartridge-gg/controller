import { AchievementPlayerAvatar, ActivityDetail, ExternalIcon } from "@/index";
import { cn, formatAddress, isPublicChain, VoyagerUrl } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { constants, getChecksumAddress } from "starknet";
import { ActivityDetails } from "../../activities/details";
import { Hex, hexToNumber } from "viem";

export interface CollectibleDetailsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleDetailsVariants> {
  address: string;
  tokenId: string;
  standard: string;
  chainId: constants.StarknetChainId;
  owner?: string;
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
  owner,
  variant,
  className,
  ...props
}: CollectibleDetailsProps) {
  return (
    <ActivityDetails
      {...props}
      className={cn(collectibleDetailsVariants({ variant }), className)}
    >
      {owner && (
        <ActivityDetail label="Owner">
          <div className="flex gap-1.5">
            <AchievementPlayerAvatar username={owner} size="sm" />
            <p className="text-sm font-medium">{owner}</p>
          </div>
        </ActivityDetail>
      )}
      <ActivityDetail label="Contract Address">
        {isPublicChain(chainId) ? (
          <a
            href={VoyagerUrl(chainId).contract(address)}
            draggable={false}
            className="flex items-center gap-x-1.5 text-sm"
            target="_blank"
          >
            <div className="font-medium text-sm">
              {formatAddress(getChecksumAddress(address), { size: "xs" })}
            </div>
            <ExternalIcon size="sm" />
          </a>
        ) : (
          <div className="text-sm">
            {formatAddress(getChecksumAddress(address), { size: "xs" })}
          </div>
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
