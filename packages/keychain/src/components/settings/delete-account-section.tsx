import { Button, SectionHeader, TrashIcon } from "@cartridge/controller-ui";
import { useCallback, useState } from "react";
import { useConnection } from "@/hooks/connection";
import { useDeleteMeMutation } from "@/utils/api";
import { DeleteAccountSheet } from "./delete-account-sheet";

export function DeleteAccountSection() {
  const { logout, controller } = useConnection();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteMe = useDeleteMeMutation();

  const handleDeleteAccount = useCallback(async () => {
    const result = await deleteMe.mutateAsync({});
    if (!result.deleteMe) {
      throw new Error("Account deletion failed");
    }
    logout();
  }, [deleteMe, logout]);

  return (
    <section className="space-y-4">
      <SectionHeader kind="delete-account" />
      <Button
        variant="sans"
        className="px-3 text-destructive-100"
        onClick={() => setIsDeleteOpen(true)}
      >
        <TrashIcon size="sm" />
        Delete Account
      </Button>

      <DeleteAccountSheet
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        username={controller?.username() ?? ""}
        onConfirm={handleDeleteAccount}
      />
    </section>
  );
}
