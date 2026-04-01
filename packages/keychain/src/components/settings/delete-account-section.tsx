import { Button, TrashIcon } from "@cartridge/ui";
import { SectionHeader } from "./section-header";

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
        type="button"
        variant="outline"
        className="py-2.5 px-3 text-destructive-100 gap-1"
        onClick={onDeleteClick}
      >
        <TrashIcon size="sm" />
        <span className="normal-case font-normal font-sans text-sm">
          Delete Account
        </span>
      </Button>
    </section>
  );
}
