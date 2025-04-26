import {
  AchievementPlayerBadge,
  Button,
  cn,
  CopyIcon,
  QuestionIcon,
  SlotIcon,
  StarknetColorIcon,
  StarknetIcon,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useCallback, useMemo } from "react";
import { formatAddress, getChainName, isSlotChain } from "@cartridge/utils";
import { constants, getChecksumAddress } from "starknet";
import { toast } from "sonner";

export const connectionTooltipContentVariants = cva(
  "select-none flex flex-col gap-2 p-4 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
  {
    variants: {
      variant: {
        default: "bg-background-150",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ConnectionTooltipContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof connectionTooltipContentVariants> {
  username: string;
  address: string;
  chainId: string;
  followers?: number;
  followings?: number;
  hideNetwork?: boolean;
  setOpen?: (open: boolean) => void;
  onFollowersClick?: () => void;
  onFollowingsClick?: () => void;
}

export const ConnectionTooltipContent = ({
  username,
  address,
  chainId,
  followers,
  followings,
  hideNetwork,
  setOpen,
  onFollowersClick,
  onFollowingsClick,
  variant,
  className,
}: ConnectionTooltipContentProps) => {
  const Icon = useMemo(() => {
    switch (chainId) {
      case constants.StarknetChainId.SN_MAIN:
        return <StarknetColorIcon />;
      case constants.StarknetChainId.SN_SEPOLIA:
        return <StarknetIcon />;
      default:
        return isSlotChain(chainId) ? <SlotIcon /> : <QuestionIcon />;
    }
  }, [chainId]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(getChecksumAddress(address));
    toast.success("Address copied");
    if (setOpen) setOpen(false);
  }, [address, setOpen]);

  const formattedAddress = useMemo(
    () =>
      formatAddress(getChecksumAddress(address), {
        first: 6,
        last: 4,
        size: "xs",
      }),
    [address],
  );

  return (
    <div
      className={cn(connectionTooltipContentVariants({ variant }), className)}
    >
      <div className="flex items-center gap-3">
        <AchievementPlayerBadge username={username} size="xl" />
        <p className="text-lg/[22px] font-semibold">{username}</p>
      </div>
      <div className="flex flex-col gap-px bg-background-200">
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-2 py-2.5 bg-background-150",
            hideNetwork && "hidden",
          )}
        >
          <p className="text-sm text-foreground-400 select-none">Network:</p>
          <div className="flex items-center gap-1.5">
            {Icon}
            <p className="text-sm font-medium">{getChainName(chainId)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-2 py-2.5 bg-background-150">
          <p className="text-sm text-foreground-400 select-none">Address:</p>
          <div onClick={() => setOpen?.(false)}>
            <div
              className="flex items-center gap-1 cursor-pointer text-foreground-300"
              onClick={onCopy}
            >
              <p className="text-sm font-mono font-normal">
                {formattedAddress}
              </p>
              <CopyIcon size="sm" />
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          (followers === undefined || followings === undefined) && "hidden",
        )}
      >
        <Button
          variant="secondary"
          className="w-1/2 normal-case font-sans"
          disabled={!onFollowersClick}
          onClick={onFollowersClick}
        >
          <p className="text-xs font-medium text-foreground-100">{followers}</p>
          <span className="text-xs font-normal text-foreground-300">
            Followers
          </span>
        </Button>
        <Button
          variant="secondary"
          className="w-1/2 normal-case font-sans"
          disabled={!onFollowingsClick}
          onClick={onFollowingsClick}
        >
          <p className="text-xs font-medium text-foreground-100">
            {followings}
          </p>
          <span className="text-xs font-normal text-foreground-300">
            Followings
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ConnectionTooltipContent;
