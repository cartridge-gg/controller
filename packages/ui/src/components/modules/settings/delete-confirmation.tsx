import React, { useCallback, useState } from "react";
import {
  Button,
  CoinsIcon,
  Drawer,
  DrawerContent,
  ErrorMessage,
  SignOutIcon,
  Spinner,
  TrashIcon,
  UnlinkIcon,
} from "@/index";

export type DeleteConfirmationKind = "delete" | "unlink" | "logout";

const variants: Record<
  DeleteConfirmationKind,
  {
    action: string;
    icon: React.ReactNode;
    buttonIcon: React.ReactNode;
  }
> = {
  delete: {
    action: "Delete",
    icon: <TrashIcon size="sm" />,
    buttonIcon: <CoinsIcon variant="solid" size="sm" />,
  },
  unlink: {
    action: "Unlink",
    icon: <UnlinkIcon size="sm" />,
    buttonIcon: <CoinsIcon variant="solid" size="sm" />,
  },
  logout: {
    action: "Log out",
    icon: <SignOutIcon size="sm" />,
    buttonIcon: null,
  },
};

export interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  label: string;
  kind?: DeleteConfirmationKind;
  icon?: React.ReactNode;
  subTitle?: string;
}

export const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  label,
  kind = "delete",
  icon,
  subTitle,
}: DeleteConfirmationProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { action, icon: defaultIcon, buttonIcon } = variants[kind];

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
        title={`${action} ${label}`}
        subTitle={subTitle}
        icon={icon ?? defaultIcon}
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
              {isDeleting ? <Spinner size="sm" /> : buttonIcon}
              {action}
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
