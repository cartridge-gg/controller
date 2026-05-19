import { Button, PlusIcon, SectionHeader } from "@cartridge/controller-ui";
import { RecoveryAccountCard } from "./recovery-account-card";
import { useNavigation } from "@/context/navigation";
// import { useExternalOwners } from "@/hooks/external";

export const RecoveryAccountSection = () => {
  const { navigate } = useNavigation();
  // const { externalOwners } = useExternalOwners();
  const externalOwners: string[] = [];

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Recovery Accounts"
        description="Recovery accounts are Starknet wallets that can be used to recover your Controller if you lose access to your signers."
      />
      {externalOwners.length > 0 && (
        <div className="space-y-3">
          {externalOwners.map((address) => (
            <RecoveryAccountCard key={address} address={address} />
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="py-2.5 px-3 text-foreground-300 gap-1"
        onClick={() => navigate("/settings/recovery")}
      >
        <PlusIcon size="sm" variant="line" />
        <span className="normal-case font-normal font-sans text-sm">
          Add Recovery Account
        </span>
      </Button>
    </section>
  );
};
