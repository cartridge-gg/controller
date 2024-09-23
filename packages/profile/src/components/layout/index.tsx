import { Button, DotsIcon, TimesIcon } from "@cartridge/ui-next";
import { PropsWithChildren } from "react";
import { useConnection } from "../provider/hooks";

export function LayoutContainer({ children }: PropsWithChildren) {
  const { parent } = useConnection();

  return (
    <ResponsiveWrapper>
      <div className="h-16 sticky top-0 flex items-center bg-[url('https://x.cartridge.gg/whitelabel/cartridge/cover.png')] bg-center bg-cover px-3 justify-between">
        <Button variant="icon" size="icon">
          <TimesIcon
            onClick={() =>
              parent.close().catch(() => {
                /* Always fails for some reason */
              })
            }
          />
        </Button>

        <div>
          <Button variant="icon" size="icon">
            <DotsIcon />
          </Button>
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
      <div className="hidden md:flex h-screen flex-col items-center justify-center">
        <div className="w-desktop h-desktop border border-border rounded-xl overflow-hidden flex flex-col">
          {children}
        </div>
      </div>

      {/* device smaller than desktop width */}
      <div className="md:hidden h-screen relative flex flex-col">
        {children}
      </div>
    </>
  );
}

type LayoutHeaderProps = {
  title: string;
  description?: string | React.ReactElement;
  // Icon?: React.ComponentType<IconProps>;
  // icon?: React.ReactElement;
};

export function LayoutHeader({ title, description }: LayoutHeaderProps) {
  return (
    <div className="flex gap-2 px-4 py-6 sticky top-16 bg-background">
      <div className="w-11 h-11 bg-secondary rounded flex items-center justify-center">
        <img
          className="w-8 h-8"
          src={"https://x.cartridge.gg/whitelabel/cartridge/icon.svg"}
        />
      </div>

      <div className="overflow-hidden">
        <div className="text-lg font-semibold truncate">{title}</div>
        {description && (
          <div className="text-xs text-accent-foreground truncate">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

export function LayoutContent({ children }: PropsWithChildren) {
  return <div className="h-full flex-1 overflow-auto px-4">{children}</div>;
}
