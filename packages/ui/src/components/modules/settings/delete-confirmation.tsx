import React, { useCallback, useState } from "react";
import { Button, CoinsIcon, Drawer, DrawerContent, Spinner } from "@/index";

export interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  icon: React.ReactNode;
  label: string;
  subTitle?: string;
  unlink?: boolean;
}

export const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  icon,
  label,
  subTitle,
  unlink,
}: DeleteConfirmationProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm, onClose]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <DrawerContent
        className="flex flex-row items-center gap-2"
        titleClassName="font-medium"
        title={`${unlink ? "Unlink" : "Delete"} ${label}`}
        subTitle={subTitle}
        icon={icon}
      >
        <Button
          variant="secondary"
          className="flex-1"
          disabled={isDeleting}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          className="flex-1 text-destructive-100"
          onClick={handleConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Spinner size="sm" />
          ) : (
            <CoinsIcon variant="solid" size="sm" />
          )}
          {unlink ? "Unlink" : "Delete"}
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

DeleteConfirmation.displayName = "DeleteConfirmation";
