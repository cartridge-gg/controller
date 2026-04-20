import React from "react";
import { cn } from "@/utils";
import { Sheet, SheetContent, SheetTitle, Thumbnail } from "@/index";

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Drawer = ({
  isOpen = true,
  showClose = true,
  onClose,
  className,
  children,
}: DrawerProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent
        side="bottom"
        className={cn(
          "absolute flex flex-col bg-spacer-100 w-fill h-fit justify-end p-4 gap-3 border-t-0 rounded-tl-[16px] rounded-tr-[16px]",
          className,
        )}
        showClose={showClose}
        portal={false}
        onInteractOutside={() => onClose?.()}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
};

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const DrawerContent = ({
  title,
  icon,
  className,
  children,
}: DrawerContentProps) => {
  return (
    <>
      <SheetTitle className="text-lg text-start font-semibold">
        <div className={cn("flex flex-row gap-3 items-center", className)}>
          <Thumbnail
            icon={React.cloneElement(icon as React.ReactElement, {
              size: "lg",
            })}
            size="lg"
            className="bg-background-100"
          />
          <div className="flex-grow truncate">{title}</div>
        </div>
      </SheetTitle>
      {children}
    </>
  );
};
