import React, { useCallback, useState } from "react";
import { cn } from "@/utils";
import { Button, Card, TrashIcon, UnlinkIcon } from "@/index";
import {
  DeleteConfirmation,
  type DeleteConfirmationKind,
} from "./delete-confirmation";

export interface SettingsCardProps {
  icon: React.ReactNode;
  label: string;
  rightText?: string | React.ReactNode;
  onDelete?: () => Promise<void>;
  confirm?: DeleteConfirmationKind;
  confirmLabel?: string;
  confirmSubTitle?: string;
  isLoading?: boolean;
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
      confirm,
      confirmLabel,
      confirmSubTitle,
      isLoading,
      ...props
    },
    ref,
  ) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDeleteUnlink = useCallback(async () => {
      if (!onDelete) return;
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
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
          <h1 className="flex-1 text-sm font-normal overflow-hidden text-ellipsis">
            {label}
          </h1>
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
            isLoading={isLoading || isDeleting}
            onClick={async () => {
              if (confirm) {
                setIsConfirmOpen(true);
              } else {
                await handleDeleteUnlink();
              }
            }}
          >
            {confirm === "unlink" ? (
              <UnlinkIcon size="default" className="text-foreground-300" />
            ) : (
              <TrashIcon size="default" className="text-foreground-300" />
            )}
          </Button>
        )}

        {confirm && (
          <DeleteConfirmation
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={handleDeleteUnlink}
            icon={icon}
            label={confirmLabel || label}
            subTitle={confirmSubTitle}
            kind={confirm}
          />
        )}
      </div>
    );
  },
);

SettingsCard.displayName = "SettingsCard";
