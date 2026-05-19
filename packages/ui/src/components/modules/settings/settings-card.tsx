import React, { useCallback, useState } from "react";
import { cn } from "@/utils";
import {
  Button,
  Card,
  CoinsIcon,
  Drawer,
  DrawerContent,
  Spinner,
  TrashIcon,
  UnlinkIcon,
} from "@/index";

export interface SettingsCardProps {
  icon: React.ReactNode;
  label: string;
  rightText?: string | React.ReactNode;
  onDelete?: () => Promise<void>;
  confirmDelete?: boolean;
  deleteLabel?: string;
  deleteSubTitle?: string;
  unlink?: boolean; // delete button is Unlink
}

export const SettingsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SettingsCardProps
>(
  (
    {
      className,
      icon,
      label,
      rightText,
      onDelete,
      confirmDelete,
      deleteLabel,
      deleteSubTitle,
      unlink,
      ...props
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDeleteUnlink = useCallback(async () => {
      if (!onDelete) return;
      setIsLoading(true);
      try {
        await onDelete();
      } finally {
        setIsLoading(false);
      }
    }, [onDelete]);

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="py-2.5 px-3 gap-1.5 flex flex-1 flex-row items-center bg-background-200">
          {icon}
          <h1 className="flex-1 text-sm font-normal">{label}</h1>
          {rightText && (
            <div className="text-xs font-normal text-foreground-300">
              {rightText}
            </div>
          )}
        </Card>
        {onDelete && (
          <Button
            variant="icon"
            size="icon"
            type="button"
            isLoading={isLoading}
            onClick={async () => {
              if (confirmDelete) {
                setIsConfirmOpen(true);
              } else {
                await handleDeleteUnlink();
              }
            }}
          >
            {unlink ? (
              <UnlinkIcon size="default" className="text-foreground-300" />
            ) : (
              <TrashIcon size="default" className="text-foreground-300" />
            )}
          </Button>
        )}

        {confirmDelete && (
          <Drawer
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
          >
            <DrawerContent
              className="flex flex-row items-center gap-2"
              titleClassName="font-medium"
              title={`${unlink ? "Unlink" : "Delete"} ${deleteLabel || label}`}
              subTitle={deleteSubTitle}
              icon={icon}
            >
              <Button
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1 text-destructive-100"
                onClick={async () => {
                  await handleDeleteUnlink();
                  setIsConfirmOpen(false);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <CoinsIcon variant="solid" size="sm" />
                )}
                {unlink ? "Unlink" : "Delete"}
              </Button>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    );
  },
);

SettingsCard.displayName = "SettingsCard";
