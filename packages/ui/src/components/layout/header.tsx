import {
  ArrowIcon,
  ControllerIcon,
  GearIcon,
  GiftIcon,
  IconProps,
  TimesIcon,
} from "@/components/icons";
import { Network } from "@/components/network";
import { Button } from "@/components/primitives/button";
import { useUI } from "@/hooks";
import { ConnectionTooltip, Thumbnail } from "@/index";
import { cn, isIframe } from "@/utils";
import { useMemo } from "react";
import { StarryHeaderBackground } from "./starry-header";
import { useCSSCustomProperty } from "@/hooks/theme";

export type HeaderProps = HeaderInnerProps & {
  onBack?: () => void;
  onClose?: () => void;
  hideUsername?: boolean;
  hideNetwork?: boolean;
  hideSettings?: boolean;
  onOpenStarterPack?: () => void;
  onFollowersClick?: () => void;
  onFollowingsClick?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
};

export function LayoutHeader({
  onBack,
  onClose,
  hideUsername,
  hideNetwork,
  hideSettings,
  onOpenStarterPack,
  onOpenSettings,
  ...innerProps
}: HeaderProps) {
  const {
    account,
    chainId,
    closeModal,
    openSettings,
    followers,
    followings,
    onFollowersClick,
    onFollowingsClick,
    onLogout,
  } = useUI();

  // Reactively watch for changes to the theme cover URL
  const coverUrl = useCSSCustomProperty("--theme-cover-url");

  // Helper function to check if we should use StarryHeader
  const shouldUseStarryHeader = useMemo(() => {
    // Use StarryHeader if:
    // 1. It's a cartridge theme, OR
    // 2. No cover URL is set or it's empty
    return coverUrl.includes("presets/cartridge/") || !coverUrl;
  }, [coverUrl]);

  const shouldShowCloseButton = useMemo(() => {
    return onClose || (closeModal && isIframe());
  }, [onClose, closeModal]);

  return (
    <div className="sticky top-0 w-full z-10 bg-background">
      {(() => {
        switch (innerProps.variant) {
          case "expanded":
            return (
              <div className="flex flex-col w-full h-[176px]">
                {shouldUseStarryHeader ? (
                  <StarryHeaderBackground className="w-full h-[136px] relative before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-background before:pointer-events-none" />
                ) : (
                  <div className="w-full h-[136px] bg-[image:var(--theme-cover-url)] bg-cover bg-center relative before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-background before:pointer-events-none" />
                )}
                <HeaderInner
                  {...innerProps}
                  className="absolute bottom-0 left-0 right-0"
                />
              </div>
            );
          case "compressed":
          default:
            return (
              <div className="flex flex-col bg-spacer-100 gap-y-px">
                {shouldUseStarryHeader ? (
                  <StarryHeaderBackground
                    className="w-full h-16 pb-6 relative before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-background-100 before:pointer-events-none"
                    height={64}
                  />
                ) : (
                  <div className="w-full bg-cover bg-center h-16 pb-6 bg-[linear-gradient(transparent,var(--background-100)),var(--theme-cover-url)]" />
                )}
                <div className="bg-background-100">
                  <HeaderInner {...innerProps} />
                </div>
              </div>
            );
        }
      })()}

      <div className="flex items-center justify-between absolute top-0 left-0 right-0 h-16 p-3 z-50">
        {onBack ? (
          <BackButton onClick={onBack} />
        ) : shouldShowCloseButton ? (
          <CloseButton
            onClose={() => {
              if (onClose) onClose();
              if (closeModal) closeModal();
            }}
          />
        ) : null}

        <div className="flex items-center gap-2">
          {!!chainId &&
            (account ? (
              <>
                {onOpenStarterPack && (
                  <Button
                    variant="secondary"
                    size="default"
                    className="gap-2"
                    onClick={onOpenStarterPack}
                  >
                    <GiftIcon size="default" variant="line" />
                    <span>Get Starter Pack</span>
                  </Button>
                )}
                <ConnectionTooltip
                  username={account.username}
                  address={account.address}
                  chainId={chainId}
                  followers={followers}
                  followings={followings}
                  hideNetwork={hideNetwork}
                  hideUsername={hideUsername}
                  onFollowersClick={onFollowersClick}
                  onFollowingsClick={onFollowingsClick}
                  onOpenSettings={
                    onOpenSettings ? onOpenSettings : openSettings
                  }
                  onLogout={onLogout}
                />
              </>
            ) : (
              !hideNetwork && <Network chainId={chainId} />
            ))}

          {openSettings && !hideSettings && (
            <SettingsButton onClick={openSettings} />
          )}
        </div>
      </div>
    </div>
  );
}

type HeaderInnerProps = {
  Icon?: React.ComponentType<IconProps>;
  icon?: React.ReactElement;
  title?: string | React.ReactElement;
  description?: string | React.ReactElement;
  variant?: HeaderVariant;
  right?: React.ReactElement;
  className?: string;
  hideIcon?: boolean;
};

type HeaderVariant = "expanded" | "compressed" | "hidden";

export function HeaderInner({
  variant,
  Icon,
  icon,
  title,
  description,
  right,
  className,
  hideIcon,
}: HeaderInnerProps) {
  if (variant === "hidden") return null;

  return (
    <div
      className={cn("p-4 pb-0 flex items-center justify-between", className)}
    >
      <div className="flex items-center flex-shrink min-w-0 gap-3">
        {!hideIcon && <HeaderIcon variant={variant} Icon={Icon} icon={icon} />}
        <Headline variant={variant} title={title} description={description} />
      </div>

      {right}
    </div>
  );
}

export function HeaderIcon({
  variant,
  Icon,
  icon,
}: Pick<HeaderInnerProps, "variant" | "Icon" | "icon">) {
  // Reactively watch for changes to the theme icon URL
  const iconUrl = useCSSCustomProperty("--theme-icon-url");

  return (
    <IconWrapper variant={variant}>
      {(() => {
        if (Icon) {
          return <Icon size="lg" />;
        }

        if (icon) {
          return icon;
        }

        if (iconUrl) {
          // This will implicitly use the theme icon url CSS variable
          return (
            <Thumbnail
              variant={variant === "expanded" ? "dark" : "default"}
              size={variant === "expanded" ? "xxl" : "lg"}
            />
          );
        }

        return (
          <Thumbnail
            variant={variant === "expanded" ? "dark" : "default"}
            size={variant === "expanded" ? "xxl" : "lg"}
            icon={
              <ControllerIcon size="xl" className="fill-current text-primary" />
            }
          />
        );
      })()}
    </IconWrapper>
  );
}

export function IconWrapper({
  variant,
  children,
}: {
  variant?: HeaderVariant;
  children: React.ReactNode;
}) {
  switch (variant) {
    case "expanded":
      return (
        <div className="flex-shrink-0 rounded size-20 bg-background flex items-center justify-center">
          <div className="rounded bg-background-200 size-[calc(100%-8px)] flex items-center justify-center">
            {children}
          </div>
        </div>
      );
    default:
    case "compressed":
      return (
        <div className="flex-shrink-0 rounded size-10 flex items-center justify-center bg-background-200">
          {children}
        </div>
      );
  }
}

function Headline({
  variant,
  title,
  description,
}: Pick<HeaderInnerProps, "variant" | "title" | "description">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 justify-between",
        variant === "expanded" ? "gap-1.5" : "gap-0.5",
      )}
    >
      <div className="text-lg/[22px] font-semibold line-clamp-1 text-ellipsis">
        {title}
      </div>

      {description && (
        <div className={cn("text-foreground-300 break-words text-xs")}>
          {description}
        </div>
      )}
    </div>
  );
}

function CloseButton({ onClose }: { onClose?: () => void }) {
  return (
    <Button variant="icon" size="icon" onClick={onClose}>
      <TimesIcon />
    </Button>
  );
}

function BackButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button variant="icon" size="icon" onClick={onClick}>
      <ArrowIcon variant="left" />
    </Button>
  );
}

function SettingsButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button variant="icon" size="icon" onClick={onClick}>
      <GearIcon />
    </Button>
  );
}
