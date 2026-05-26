import { Button, PlusIcon, SectionHeader } from "@cartridge/controller-ui";
import { useNavigation } from "@/context/navigation";

export function DelegateAccountSection() {
  const { navigate } = useNavigation();

  return (
    <section className="space-y-4">
      <SectionHeader kind="delegate" />
      <Button variant="sans" onClick={() => navigate("/settings/delegate")}>
        <PlusIcon size="sm" variant="line" />
        Set Delegate Account
      </Button>
    </section>
  );
}
