import { Button, SectionHeader, TrashIcon } from "@cartridge/controller-ui";

interface DeleteAccountSectionProps {
  onDeleteClick: () => void;
}

export function DeleteAccountSection({
  onDeleteClick,
}: DeleteAccountSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Delete Account"
        description="Permanently delete your account and all associated data. This action cannot be undone."
      />
      <Button
        variant="sans"
        className="px-3 text-destructive-100"
        onClick={onDeleteClick}
      >
        <TrashIcon size="sm" />
        Delete Account
      </Button>
    </section>
  );
}
