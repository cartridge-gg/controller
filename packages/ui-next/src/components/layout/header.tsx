import {
  ArrowIcon,
  ControllerIcon,
  GearIcon,
  IconProps,
  QuestionIcon,
  SlotIcon,
  StarknetColorIcon,
  StarknetIcon,
  TimesIcon,
  GiftIcon,
} from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/primitives/tooltip";
import { cn } from "@/utils";
import { Button } from "@/components/primitives/button";
import { getChainName, isIframe, isSlotChain } from "@cartridge/utils";
import { constants } from "starknet";
import { CopyAddress } from "../copy-address";
import { Network } from "@/components/network";
import { useUI } from "@/hooks";

export type HeaderProps = HeaderInnerProps & {
  onBack?: () => void;
  onClose?: () => void;
  hideUsername?: boolean;
  hideNetwork?: boolean;
  hideSettings?: boolean;
  onOpenStarterPack?: () => void;
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
  const { account, chainId, closeModal, openSettings } = useUI();

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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      className={cn(
                        "flex items-center gap-1.5 bg-background-200 hover:bg-background-300 rounded px-3 py-2.5",
                        hideUsername && "hidden",
                      )}
                    >
                      {/* TODO: Replace with avatar */}
                      <ControllerIcon size="sm" />
                      <div className="text-sm font-semibold">
                        {account.username}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center gap-8 px-3 py-2.5 bg-spacer">
                      {!hideNetwork && (
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            switch (chainId) {
                              case constants.StarknetChainId.SN_MAIN:
                                return <StarknetColorIcon />;
                              case constants.StarknetChainId.SN_SEPOLIA:
                                return <StarknetIcon />;
                              default:
                                return isSlotChain(chainId) ? (
                                  <SlotIcon />
                                ) : (
                                  <QuestionIcon />
                                );
                            }
                          })()}
                          <div className="text-sm">{getChainName(chainId)}</div>
                        </div>
                      )}
                      <CopyAddress
                        size="xs"
                        className="text-sm"
                        address={account.address}
                      />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
      className={cn(
        "px-6 pt-6 pb-4 flex items-center justify-between",
        className,
      )}
    >
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
          <div className="rounded bg-background-200 size-[calc(100%-8px)] flex items-center justify-center">
            {children}
          </div>
        </div>
      );
    default:
    case "compressed":
      return (
        <div className="flex-shrink-0 rounded size-11 flex items-center justify-center bg-background-200">
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
            "text-foreground-300 break-words",
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
