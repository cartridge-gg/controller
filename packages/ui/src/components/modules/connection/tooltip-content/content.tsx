import {
  AchievementPlayerBadge,
  Button,
  CopyIcon,
  GlobeIcon,
  SlotIcon,
  StarknetColorIcon,
  StarknetIcon,
  Thumbnail,
  useUI,
} from "@/index";
import { cn, formatAddress, getChainName, isSlotChain } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useCallback, useMemo } from "react";
import { constants, getChecksumAddress } from "starknet";
import { toast } from "sonner";
import { useLayoutContext } from "@/components/layout/context";
import QrCodeIcon from "@/components/icons/utility/qr-code";

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
  const { setWithBackground } = useLayoutContext();
  const { showQrCode } = useUI();

  const Icon = useMemo(() => {
    switch (chainId) {
      case constants.StarknetChainId.SN_MAIN:
        return <StarknetColorIcon className="scale-[1.33]" />;
      case constants.StarknetChainId.SN_SEPOLIA:
        return <StarknetIcon className="scale-150" />;
      default:
        return isSlotChain(chainId) ? (
          <SlotIcon className="scale-150" />
        ) : (
          <GlobeIcon variant="solid" className="scale-150" />
        );
    }
  }, [chainId]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(getChecksumAddress(address));
    toast.success("Address copied");
    setWithBackground(false);
    if (setOpen) setOpen(false);
  }, [address, setOpen, setWithBackground]);

  const formattedAddress = useMemo(
    () =>
      formatAddress(getChecksumAddress(address), {
        first: 6,
        last: 4,
        size: "xs",
      }),
    [address],
  );

  const handleShowQrCode = useCallback(() => {
    if (!showQrCode) return;
    setOpen?.(false);
    setWithBackground(false);
    showQrCode(true);
  }, [showQrCode, setOpen, setWithBackground]);

  return (
    <div
      className={cn(
        connectionTooltipContentVariants({ variant }),
        className,
        "relative",
      )}
    >
      <div className="flex items-start w-full gap-3 justify-between">
        <div className="flex items-center gap-3">
          <AchievementPlayerBadge username={username} size="xl" />
          <p className="text-lg/[22px] font-semibold">{username}</p>
        </div>
        {address && (
          <div
            onClick={handleShowQrCode}
            className=" absolute flex top-4 right-4 items-center gap-3 w-10 h-10 bg-background-200 rounded-full justify-center cursor-pointer hover:bg-background-300 transition-all"
          >
            <QrCodeIcon />
          </div>
        )}
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
            <Thumbnail size="xs" icon={Icon} rounded />
            <p className="text-sm font-medium capitalize">
              {getChainName(chainId).toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-2 py-2.5 bg-background-150">
          <p className="text-sm text-foreground-400 select-none">Address:</p>
          <div onClick={() => setOpen?.(false)}>
            <div
              className="flex items-center gap-1 cursor-pointer text-foreground-300 hover:text-foreground-200"
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
          className="w-1/2 h-9 normal-case font-sans"
          disabled={!onFollowersClick}
          onClick={onFollowersClick}
        >
          <p className="text-sm font-medium text-foreground-100">{followers}</p>
          <span className="text-sm font-normal text-foreground-300">
            Followers
          </span>
        </Button>
        <Button
          variant="secondary"
          className="w-1/2 h-9 normal-case font-sans"
          disabled={!onFollowingsClick}
          onClick={onFollowingsClick}
        >
          <p className="text-sm font-medium text-foreground-100">
            {followings}
          </p>
          <span className="text-sm font-normal text-foreground-300">
            Following
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ConnectionTooltipContent;
