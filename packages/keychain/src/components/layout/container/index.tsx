import { PropsWithChildren, useEffect, useState } from "react";
import { Header, HeaderProps } from "./header";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

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
      <div className={`flex flex-col flex-1 min-h-0 ${className}`}>
        {children}
      </div>
    </ResponsiveWrapper>
  );
}

function ResponsiveWrapper({ children }: PropsWithChildren) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <div className="flex w-screen h-screen items-center justify-center">
        <div className="w-desktop border border-muted rounded-xl flex flex-col relative overflow-hidden align-middle">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen max-w-desktop relative flex flex-col bg-background">
      {children}
    </div>
  );
}
