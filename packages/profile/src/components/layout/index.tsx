import { Button, cn, TimesIcon, Network } from "@cartridge/ui-next";
import { PropsWithChildren, useCallback } from "react";
import { useConnection } from "@/hooks/context";

export function LayoutContainer({
  children,
  left,
}: PropsWithChildren & { left?: React.ReactNode }) {
  const { parent, chainId } = useConnection();

  const onClose = useCallback(() => {
    parent.close().catch(() => {
      /* Always fails for some reason */
    });
  }, [parent]);

  return (
    <ResponsiveWrapper>
      <div className="h-16 sticky top-0 flex items-center bg-[url('https://x.cartridge.gg/whitelabel/cartridge/cover.png')] bg-center bg-cover px-3 justify-between">
        {left ?? (
          <Button variant="icon" size="icon" onClick={onClose}>
            <TimesIcon />
          </Button>
        )}

        <div className="flex gap-2">
          <Network chainId={chainId} />
          {/* <Button variant="icon" size="icon">
            <DotsIcon />
          </Button> */}
        </div>
      </div>

      {children}
    </ResponsiveWrapper>
  );
}

function ResponsiveWrapper({ children }: PropsWithChildren) {
  return (
    <>
      {/* for desktop */}
      <div className="hidden md:flex h-screen flex-col items-center justify-center overflow-x-hidden">
        <div className="w-desktop h-desktop border border-border rounded-xl overflow-hidden flex flex-col relative">
          {children}
        </div>
      </div>

      {/* device smaller than desktop width */}
      <div className="md:hidden h-screen relative flex flex-col overflow-x-hidden">
        {children}
      </div>
    </>
  );
}

type LayoutHeaderProps = {
  title: string;
  description?: string | React.ReactElement;
  icon?: string;
  right?: React.ReactElement;
};

export function LayoutHeader({
  title,
  description,
  icon,
  right,
}: LayoutHeaderProps) {
  return (
    <div className="flex gap-2 px-4 py-6 sticky top-16 bg-background justify-between">
      <div className="flex min-w-0 gap-2 items-center">
        <div className="w-11 h-11 bg-secondary rounded flex shrink-0 items-center justify-center overflow-hidden">
          <div
            className="w-full bg-cover bg-center h-full place-content-center"
            style={{
              backgroundImage: `url(${
                icon ?? "https://x.cartridge.gg/whitelabel/cartridge/icon.svg"
              })`,
            }}
          />
        </div>

        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="text-lg font-semibold truncate">{title}</div>
          {description && typeof description === "string" ? (
            <div className="text-xs text-muted-foreground truncate">
              {description}
            </div>
          ) : (
            description
          )}
        </div>
      </div>

      {right && right}
    </div>
  );
}

export function LayoutContent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col h-full flex-1 overflow-y-auto px-4 gap-y-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LayoutFooter({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col px-6 py-4 gap-y-4 w-full absolute left-0 bottom-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
