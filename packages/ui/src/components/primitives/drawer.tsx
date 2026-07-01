import React from "react";
import { cn } from "@/utils";
import { Sheet, SheetContent, SheetTitle, Thumbnail } from "@/index";

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  showClose?: boolean;
  onClose?: (event?: Event) => void;
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
        onInteractOutside={(event: Event) => onClose?.(event)}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
};

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subTitle?: string;
  icon: React.ReactNode;
  className?: string;
  titleClassName?: string;
  children: React.ReactNode;
}

export const DrawerContent = ({
  title,
  subTitle,
  icon,
  className,
  titleClassName,
  children,
}: DrawerContentProps) => {
  return (
    <>
      <SheetTitle
        className={cn("text-lg text-start font-semibold", titleClassName)}
      >
        <div className="flex flex-row gap-3 items-center">
          <Thumbnail
            icon={React.cloneElement(icon as React.ReactElement, {
              size: "lg",
            })}
            size="lg"
            className="bg-background-100"
          />
          <div className="flex flex-col gap-0 max-w-[75%]">
            <div className="flex-grow truncate text-foreground-100">
              {title}
            </div>
            {subTitle && (
              <div className="flex-grow truncate text-xs font-normal text-foreground-300">
                {subTitle}
              </div>
            )}
          </div>
        </div>
      </SheetTitle>
      <div
        className={cn(
          "flex flex-col gap-4 max-h-[75vh] overflow-y-scroll",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};
