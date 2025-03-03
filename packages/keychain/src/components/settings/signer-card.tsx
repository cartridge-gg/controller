import React from "react";
import {
  cn,
  Button,
  Card,
  CardContent,
  TrashIcon,
  MobileIcon,
  DesktopIcon,
  LaptopIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@cartridge/ui-next";

export type DeviceType = "mobile" | "laptop" | "desktop";

export interface Signer {
  deviceType: DeviceType;
  deviceName: string;
}

export interface SignerCardProps extends Signer {
  onDelete?: () => void;
}

export const SignerCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SignerCardProps
>(({ className, deviceName, deviceType, onDelete, ...props }, ref) => {
  return (
    <Sheet>
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="flex flex-1 flex-row items-center bg-background-100 border border-background-200">
          <CardContent className="relative bg-background-200 size-10 flex items-center justify-center">
            <DeviceIcon deviceType={deviceType} />
          </CardContent>
          <CardContent className="bg-background-100 py-2.5 px-3">
            <h1 className="flex-1 text-sm font-normal">{deviceName}</h1>
          </CardContent>
        </Card>
        <SheetTrigger asChild>
          <Button variant="icon" size="icon" type="button">
            <TrashIcon size="default" className="text-foreground-300" />
          </Button>
        </SheetTrigger>
      </div>

      {/* DELETE SIGNER SHEET CONTENTS */}
      <SheetContent
        side="bottom"
        className="border-background-100 p-6 gap-6 rounded-t-xl"
        showClose={false}
      >
        <div className="flex flex-row items-center gap-3 mb-6">
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="flex items-center justify-center"
          >
            <DeviceIcon deviceType={deviceType} />
          </Button>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-foreground-100">
              {deviceName}
            </h3>
          </div>
        </div>
        <SheetFooter className="flex flex-row items-center gap-4">
          <SheetClose asChild className="flex-1">
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button
            variant="secondary"
            onClick={onDelete}
            className="flex-1 text-destructive-100"
          >
            <TrashIcon size="default" />
            <span>DELETE</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

SignerCard.displayName = "SignerCard";

const DeviceIcon = React.memo(({ deviceType }: { deviceType: DeviceType }) => {
  return deviceType === "mobile" ? (
    <MobileIcon variant="solid" size="default" className="absolute" />
  ) : deviceType === "laptop" ? (
    <LaptopIcon variant="solid" size="default" className="absolute" />
  ) : (
    <DesktopIcon variant="solid" size="default" className="absolute" />
  );
});
