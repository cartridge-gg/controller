import React from "react";
import { cn } from "@/utils";
import { Button, Card, CardContent } from "@/index";
import { TrashIcon, MobileIcon } from "@/index";

type DeviceType = "mobile" | "laptop" | "desktop";

interface SignerCardProps {
  className?: string;
  deviceType: DeviceType;
  deviceName: string;
  onDelete?: () => void;
}

export const SignerCard = React.forwardRef<HTMLDivElement, SignerCardProps>(
  ({ className, deviceName }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between gap-3", className)}
      >
        <Card className="flex flex-row items-center bg-background-100 border border-background-200">
          <CardContent className="relative bg-background-200 size-10 flex items-center justify-center">
            <MobileIcon variant="solid" size="default" className="absolute" />
          </CardContent>
          <CardContent className="bg-background-100 py-2.5 px-3">
            <h1 className="flex-1 text-sm font-normal">{deviceName}</h1>
          </CardContent>
        </Card>
        <Button variant="icon" size="icon">
          <TrashIcon size="default" className="text-foreground-300" />
        </Button>
      </div>
    );
  },
);

SignerCard.displayName = "SignerCard";
