import { Network } from "@/components/network";
import { ArrowIcon, GearIcon, IconProps, TimesIcon } from "@/components/icons";
import { cn } from "@/utils";
import { Button } from "@/components/primitives/button";
import { isIframe } from "@cartridge/utils";

export type HeaderProps = HeaderInnerProps & {
  onBack?: () => void;
  closeModal?: () => void;
  chainId?: string;
  openSettings?: () => void;
};

export function LayoutHeader({
  onBack,
  onClose,
  chainId,
  openSettings,
  ...innerProps
}: HeaderProps & { onClose?: () => void }) {
  return (
    <div className="sticky top-0 w-full z-10 bg-background">
      {(() => {
        switch (innerProps.variant) {
          case "expanded":
            return (
              <div className="flex flex-col w-full h-[136px] bg-[image:var(--theme-cover-url)] bg-cover bg-center relative mb-16 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-background before:pointer-events-none">
                <HeaderInner
                  {...innerProps}
                  className="absolute -bottom-10 left-0 right-0"
                />
              </div>
            );
          case "compressed":
          default:
            return (
              <div className="flex flex-col">
                <div className="w-full bg-[image:var(--theme-cover-url)] bg-cover bg-center h-14 pb-6" />
                <HeaderInner {...innerProps} />
              </div>
            );
        }
      })()}

      <div className="flex items-center justify-between absolute top-0 left-0 right-0 h-14 p-2 z-50">
        <div>
          {onBack ? (
            <BackButton onClick={onBack} />
          ) : onClose ? (
            <CloseButton onClose={onClose} />
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {chainId && <Network chainId={chainId} />}

          {openSettings && <SettingsButton onClick={openSettings} />}
        </div>
      </div>
    </div>
  );
}

type HeaderInnerProps = {
  Icon?: React.ComponentType<IconProps>;
  icon?: React.ReactElement;
  title: string | React.ReactElement;
  description?: string | React.ReactElement;
  variant?: HeaderVariant;
  right?: React.ReactElement;
  className?: string;
};

type HeaderVariant = "expanded" | "compressed";

function HeaderInner({
  variant,
  Icon,
  icon,
  title,
  description,
  right,
  className,
}: HeaderInnerProps) {
  return (
    <div className={cn("p-4 flex items-center justify-between", className)}>
      <div className="flex items-center gap-4 flex-shrink min-w-0">
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
          <div className="size-full rounded bg-[image:var(--theme-icon-url)] bg-cover bg-center" />
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
          <div className="rounded bg-background-100 size-[calc(100%-8px)] flex items-center justify-center">
            {children}
          </div>
        </div>
      );
    default:
    case "compressed":
      return (
        <div className="flex-shrink-0 rounded size-11 flex items-center justify-center bg-background-100">
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
    <div className="flex flex-col gap-1">
      <div className="text-lg font-semibold line-clamp-1 text-ellipsis">
        {title}
      </div>

      {description && (
        <div
          className={cn(
            "text-muted-foreground break-words",
            variant === "compressed" ? "text-xs" : "text-sm",
          )}
        >
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
