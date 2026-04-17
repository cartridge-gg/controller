"use client";

import { useMemo } from "react";
import { Toaster as SonnerToster } from "sonner";

type SonnerToasterProps = React.ComponentProps<typeof SonnerToster> & {
  toasterId?: string;
};

const SonnerToaster = ({ toasterId, ...props }: SonnerToasterProps) => {
  const theme = useMemo(
    () => localStorage.getItem("vite-ui-colorScheme") ?? "system",
    [],
  );

  return (
    <SonnerToster
      theme={theme as SonnerToasterProps["theme"]}
      className="toaster group"
      duration={1000}
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
