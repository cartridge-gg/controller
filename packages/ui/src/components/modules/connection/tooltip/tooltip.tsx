import { useLayoutContext } from "@/components/layout/context";
import {
  AchievementPlayerAvatar,
  ConnectionTooltipContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const connectionTooltipVariants = cva(
  "flex items-center gap-1.5 rounded px-3 py-2.5",
  {
    variants: {
      variant: {
        darkest: "bg-background-100 hover:bg-background-200",
        darker: "bg-background-100 hover:bg-background-200",
        dark: "bg-background-100 hover:bg-background-200",
        default: "bg-background-200 hover:bg-background-300",
        light: "bg-background-300 hover:bg-background-400",
        lighter: "bg-background-400 hover:bg-background-500",
        lightest: "bg-background-500 hover:bg-background-500",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ConnectionTooltipProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof connectionTooltipVariants> {
  username?: string;
  address?: string;
  chainId?: string;
  followers?: number;
  followings?: number;
  hideUsername?: boolean;
  hideNetwork?: boolean;
  onFollowersClick?: () => void;
  onFollowingsClick?: () => void;
}

export const ConnectionTooltip = ({
  username,
  address,
  chainId,
  followers,
  followings,
  hideUsername,
  hideNetwork,
  onFollowersClick,
  onFollowingsClick,
  variant,
  className,
  children,
  ...props
}: ConnectionTooltipProps) => {
  const { setWithBackground } = useLayoutContext();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen]);

  const handleClick = useCallback(() => {
    setOpen(true);
    setWithBackground(true);
  }, [setOpen, setWithBackground]);

  const handleFollowersClick = useCallback(() => {
    onFollowersClick?.();
    setOpen(false);
    setWithBackground(false);
  }, [onFollowersClick, setOpen, setWithBackground]);

  const handleFollowingsClick = useCallback(() => {
    onFollowingsClick?.();
    setOpen(false);
    setWithBackground(false);
  }, [onFollowingsClick, setOpen, setWithBackground]);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={() => {}}>
        <div ref={triggerRef} {...props}>
          <TooltipTrigger
            className={cn(
              connectionTooltipVariants({ variant }),
              className,
              hideUsername && "hidden",
            )}
            onClick={handleClick}
          >
            {username && (
              <AchievementPlayerAvatar username={username} size="sm" />
            )}
            <div className="text-sm font-semibold">{username}</div>
          </TooltipTrigger>
        </div>
        <TooltipContent
          ref={contentRef}
          className="p-0 overflow-visible my-1 mx-3"
        >
          {username && address && chainId && (
            <ConnectionTooltipContent
              username={username}
              address={address}
              chainId={chainId}
              followers={followers}
              followings={followings}
              hideNetwork={hideNetwork}
              setOpen={setOpen}
              onFollowersClick={
                onFollowersClick ? handleFollowersClick : undefined
              }
              onFollowingsClick={
                onFollowingsClick ? handleFollowingsClick : undefined
              }
            />
          )}
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionTooltip;
