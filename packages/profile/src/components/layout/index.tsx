import { Button, DotsIcon, TimesIcon } from "@cartridge/ui-next";
import { PropsWithChildren } from "react";

export function LayoutContainer({ children }: PropsWithChildren) {
  return (
    <ResponsiveWrapper>
      <Header />
      <div className="h-full overflow-auto p-4">{children}</div>
    </ResponsiveWrapper>
  );
}

export function LayoutHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <div>{title}</div>
      {description && <div>{description}</div>}
    </div>
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
    <div className="h-16 sticky top-0 flex items-center bg-primary px-3 justify-between">
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
