import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Header, HeaderProps } from "./header";
import { useDisclosure } from "@cartridge/ui-next";

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
  variant = "compressed",
  className,
}: {
  variant?: LayoutVariant;
} & PropsWithChildren &
  HeaderProps & { className?: string }) {
  const [height, setHeight] = useState(0);

  const { isOpen, onToggle } = useDisclosure();
  return (
    <LayoutContext.Provider
      value={{ variant, footer: { height, setHeight, isOpen, onToggle } }}
    >
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
        />
        <div className={className}>{children}</div>
      </ResponsiveWrapper>
    </LayoutContext.Provider>
  );
}

export const FOOTER_HEIGHT = 40;
export const PORTAL_WINDOW_HEIGHT = 600;

function ResponsiveWrapper({ children }: PropsWithChildren) {
  return (
    <>
      {/* for desktop */}
      <div className="hidden md:flex flex-col items-center justify-center">
        <div className="w-desktop border border-muted rounded-xl overflow-hidden flex flex-col relative">
          {children}
        </div>
      </div>

      {/* device smaller than desktop width */}
      <div className="md:hidden h-screen relative flex flex-col bg-background">
        {children}
      </div>
    </>
  );
}

export const LayoutContext = createContext<LayoutContextValue>({
  variant: "expanded",
  footer: {
    height: 0,
    setHeight: () => {},
    isOpen: false,
    onToggle: () => {},
  },
});

export type LayoutContextValue = {
  variant: LayoutVariant;
  footer: {
    height: number;
    setHeight: (height: number) => void;
    isOpen: boolean;
    onToggle: () => void;
  };
};

export type LayoutVariant = "expanded" | "compressed";

export function useLayout() {
  return useContext(LayoutContext);
}

export function useLayoutVariant(): LayoutVariant {
  return useLayout().variant;
}
