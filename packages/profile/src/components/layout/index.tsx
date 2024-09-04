import { Button, DotsIcon, TimesIcon, IconProps } from "@cartridge/ui-next";
import { PropsWithChildren } from "react";

export function LayoutContainer({ children }: PropsWithChildren) {
  return (
    <ResponsiveWrapper>
      {/* <div className="flex flex-col gap-6"> */}
      <Header />
      <div className="h-full overflow-auto px-4">{children}</div>
      {/* </div> */}
    </ResponsiveWrapper>
  );
}

function ResponsiveWrapper({ children }: PropsWithChildren) {
  return (
    <>
      {/* for desktop */}
      <div className="hidden md:flex h-screen flex-col items-center justify-center">
        <div className="w-desktop h-desktop border border-border rounded-xl overflow-hidden">
          {children}
        </div>
      </div>

      {/* < desktop width */}
      <div className="md:hidden h-screen relative">{children}</div>
    </>
  );
}

function Header() {
  return (
    <div className="h-16 sticky top-0 flex items-center bg-[url('https://x.cartridge.gg/whitelabel/cartridge/cover.png')] bg-center bg-cover px-3 justify-between">
      <Button variant="icon" size="icon">
        <TimesIcon />
      </Button>

      <div>
        <Button variant="icon" size="icon">
          <DotsIcon />
        </Button>
      </div>
    </div>
  );
}

type LayoutHeaderProps = {
  title: string;
  description?: string | React.ReactElement;
  // Icon?: React.ComponentType<IconProps>;
  // icon?: React.ReactElement;
};

export function LayoutHeader({
  title,
  description,
}: // Icon,
// icon,
LayoutHeaderProps) {
  return (
    <div className="flex gap-2 py-6 sticky top-0 bg-background">
      {/* {Icon ? (
        <Circle size={ICON_IMAGE_SIZE / 4} bg="solid.primary">
          <Icon boxSize={8} />
        </Circle>
      ) : icon ? (
        <Circle size={ICON_IMAGE_SIZE / 4} bg="solid.primary">
          {icon}
        </Circle>
      ) : (
        <Image
          src={theme.icon}
          boxSize={ICON_IMAGE_SIZE / 4}
          alt="Controller Icon"
        />
      )} */}
      <div className="w-11 h-11 bg-secondary rounded flex items-center justify-center">
        <img
          className="w-8 h-8"
          src={"https://x.cartridge.gg/whitelabel/cartridge/icon.svg"}
        />
      </div>

      <div>
        <div className="text-lg font-semibold">{title}</div>
        {description && (
          <div className="text-xs text-accent-foreground">{description}</div>
        )}
      </div>
    </div>
  );
}
