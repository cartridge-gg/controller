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
} from "@cartridge/ui-next";

export type DeviceType = "mobile" | "laptop" | "desktop";

export interface SignerCardProps {
  className?: string;
  deviceType: DeviceType;
  deviceName: string;
  onDelete?: () => void;
}

export const SignerCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SignerCardProps
>(({ className, deviceName, deviceType, onDelete }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center gap-3", className)}>
      <Card className="flex flex-1 flex-row items-center bg-background-100 border border-background-200">
        <CardContent className="relative bg-background-200 size-10 flex items-center justify-center">
          <DeviceIcon deviceType={deviceType} />
        </CardContent>
        <CardContent className="bg-background-100 py-2.5 px-3">
          <h1 className="flex-1 text-sm font-normal">{deviceName}</h1>
        </CardContent>
      </Card>
      <Button variant="icon" size="icon" type="button" onClick={onDelete}>
        <TrashIcon size="default" className="text-foreground-300" />
      </Button>
    </div>
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
