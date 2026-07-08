"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";

type SonnerToasterProps = React.ComponentProps<typeof Sonner> & {
  toasterId?: string;
};

const SonnerToaster = ({ toasterId, ...props }: SonnerToasterProps) => {
  // localStorage only exists in the browser; read it after mount so the
  // component stays SSR-safe.
  const [theme, setTheme] = useState<SonnerToasterProps["theme"]>("system");
  useEffect(() => {
    setTheme(
      (localStorage.getItem("vite-ui-colorScheme") ??
        "system") as SonnerToasterProps["theme"],
    );
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      duration={5000}
      id={toasterId}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-lg",
          description: "group-[.toast]:text-foreground-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-background-200 group-[.toast]:text-foreground-400",
        },
      }}
      {...props}
    />
  );
};

export { SonnerToaster };
