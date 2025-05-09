import {
  ArrowIcon,
  GearIcon,
  IconProps,
  TimesIcon,
  GiftIcon,
} from "@/components/icons";
import { cn } from "@/utils";
import { Button } from "@/components/primitives/button";
import { isIframe } from "@cartridge/ui/utils";
import { Network } from "@/components/network";
import { useUI } from "@/hooks";
import { ConnectionTooltip, Thumbnail } from "@/index";
import { StarryHeaderBackground } from "./starry-header";

export type HeaderProps = HeaderInnerProps & {
  onBack?: () => void;
  onClose?: () => void;
  hideUsername?: boolean;
  hideNetwork?: boolean;
  hideSettings?: boolean;
  onOpenStarterPack?: () => void;
  onFollowersClick?: () => void;
  onFollowingsClick?: () => void;
};

export function LayoutHeader({
  onBack,
  onClose,
  hideUsername,
  hideNetwork,
  hideSettings,
  onOpenStarterPack,
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
  } = useUI();

  return (
    <div className="sticky top-0 w-full z-10 bg-background">
      {(() => {
        switch (innerProps.variant) {
          case "expanded":
            return (
              <div className="flex flex-col w-full h-[176px]">
                {getComputedStyle(document.documentElement)
                  .getPropertyValue("--theme-cover-url")
                  .includes("presets/cartridge/") ? (
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
                <div className="w-full bg-cover bg-center h-16 pb-6 bg-[linear-gradient(transparent,var(--background-100)),var(--theme-cover-url)]" />
                <div className="bg-background-100">
                  <HeaderInner {...innerProps} />
                </div>
              </div>
            );
        }
      })()}

      <div className="flex items-center justify-between absolute top-0 left-0 right-0 h-16 p-2 z-50">
        <div>
          {onBack ? (
            <BackButton onClick={onBack} />
          ) : closeModal || onClose ? (
            <CloseButton
              onClose={() => {
                if (onClose) onClose();
                if (closeModal) closeModal();
              }}
            />
          ) : null}
        </div>

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
};

type HeaderVariant = "expanded" | "compressed" | "hidden";

function HeaderInner({
  variant,
  Icon,
  icon,
  title,
  description,
  right,
  className,
}: HeaderInnerProps) {
  if (variant === "hidden") return null;

  return (
    <div
      className={cn("p-6 pb-0 flex items-center justify-between", className)}
    >
      <div className="flex items-center flex-shrink min-w-0 gap-3">
        <HeaderIcon variant={variant} Icon={Icon} icon={icon} />
        <Headline variant={variant} title={title} description={description} />
      </div>

      {right}
    </div>
  );
}

function HeaderIcon({
  variant,
  Icon,
  icon,
}: Pick<HeaderInnerProps, "variant" | "Icon" | "icon">) {
  return (
    <IconWrapper variant={variant}>
      {(() => {
        if (Icon) {
          return <Icon size="lg" />;
        }

        if (icon) {
          return icon;
        }

        return (
          <Thumbnail
            variant={variant === "expanded" ? "dark" : "default"}
            size={variant === "expanded" ? "xxl" : "lg"}
          />
        );
      })()}
    </IconWrapper>
  );
}

function IconWrapper({
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
  if (!isIframe()) {
    return null;
  }

  return (
    <Button variant="icon" size="icon" onClick={onClick}>
      <ArrowIcon variant="left" />
    </Button>
  );
}

function SettingsButton({ onClick }: { onClick?: () => void }) {
  if (!isIframe()) {
    return null;
  }

  return (
    <Button variant="icon" size="icon" onClick={onClick}>
      <GearIcon />
    </Button>
  );
}
