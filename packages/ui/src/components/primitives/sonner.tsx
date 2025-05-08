"use client";

import { useMemo } from "react";
import { Toaster as Sonner } from "sonner";

type SonnerToasterProps = React.ComponentProps<typeof Sonner>;

const SonnerToaster = ({ ...props }: SonnerToasterProps) => {
  const theme = useMemo(
    () => localStorage.getItem("vite-ui-colorScheme") ?? "system",
    [],
  );

  return (
    <Sonner
      theme={theme as SonnerToasterProps["theme"]}
      className="toaster group"
      duration={1000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
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
