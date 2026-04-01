import {
  AlertIcon,
  Button,
  Input,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SpinnerIcon,
  TrashIcon,
} from "@cartridge/ui";
import { useState } from "react";

export interface DeleteAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountSheet({
  open,
  onOpenChange,
  username,
  onConfirm,
}: DeleteAccountSheetProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText === username;

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText("");
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="border-background-100 p-6 gap-6 rounded-t-xl"
        showClose={false}
      >
        <SheetTitle className="hidden"></SheetTitle>
        <div className="flex flex-row items-center gap-3 mb-6">
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="flex items-center justify-center text-destructive-100"
          >
            {isLoading ? (
              <SpinnerIcon className="animate-spin" size="lg" />
            ) : (
              <AlertIcon size="lg" />
            )}
          </Button>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-foreground-100">
              Delete Account?
            </h3>
            <p className="text-sm text-foreground-300">
              This will permanently delete your account, all controllers,
              sessions, and associated data. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-foreground-300">
            Type{" "}
            <span className="font-semibold text-foreground-100">
              {username}
            </span>{" "}
            to confirm.
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={username}
            disabled={isLoading}
            data-testid="delete-confirm-input"
          />
          {error && <p className="text-sm text-destructive-100">{error}</p>}
        </div>

        <SheetFooter className="flex flex-row items-center gap-4">
          <SheetClose asChild className="flex-1">
            <Button variant="secondary" disabled={isLoading}>
              Cancel
            </Button>
          </SheetClose>
          <Button
            variant="secondary"
            onClick={handleDelete}
            className="flex-1 text-destructive-100"
            disabled={!isConfirmed || isLoading}
            data-testid="delete-confirm-button"
          >
            {isLoading ? (
              <SpinnerIcon className="animate-spin" />
            ) : (
              <TrashIcon size="default" />
            )}
            <span>DELETE</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
