import { PropsWithChildren } from "react";
import { Header, HeaderProps } from "./header";
export function Container({
  children,
  onBack,
  onClose,
  hideAccount,
  hideNetwork,
  Icon,
  icon,
  title,
  description,
  className,
  variant,
}: PropsWithChildren & HeaderProps & { className?: string }) {
  return (
    <ResponsiveWrapper>
      <Header
        onBack={onBack}
        onClose={onClose}
        hideAccount={hideAccount}
        hideNetwork={hideNetwork}
        Icon={Icon}
        icon={icon}
        title={title}
        description={description}
        variant={variant}
      />
      <div className={className}>{children}</div>
    </ResponsiveWrapper>
  );
}

function ResponsiveWrapper({ children }: PropsWithChildren) {
  return (
    <>
      {/* for desktop */}
      <div className="hidden md:flex w-screen h-screen items-center justify-center">
        <div className="w-desktop border border-muted rounded-xl flex flex-col relative overflow-hidden align-middle min-h-[360px]">
          {children}
        </div>
      </div>

      {/* device smaller than desktop width */}
      <div className="md:hidden w-screen h-screen max-w-desktop relative flex flex-col bg-background">
        {children}
      </div>
    </>
  );
}
