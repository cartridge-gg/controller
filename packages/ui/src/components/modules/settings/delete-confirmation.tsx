import React, { useCallback, useState } from "react";
import {
  Button,
  CoinsIcon,
  Drawer,
  DrawerContent,
  ErrorMessage,
  Spinner,
} from "@/index";

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
  const [error, setError] = useState<string | undefined>();

  const handleClose = useCallback(() => {
    setError(undefined);
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    setError(undefined);
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      console.error(`Delete error:`, e);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm, onClose]);

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        titleClassName="font-medium"
        title={`${unlink ? "Unlink" : "Delete"} ${label}`}
        subTitle={subTitle}
        icon={icon}
      >
        {!error && (
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={isDeleting}
              onClick={handleClose}
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
          </div>
        )}
        {error && (
          <>
            <ErrorMessage label={error} />
            <Button
              variant="secondary"
              className="flex-1"
              disabled={isDeleting}
              onClick={handleClose}
            >
              Close
            </Button>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

DeleteConfirmation.displayName = "DeleteConfirmation";
