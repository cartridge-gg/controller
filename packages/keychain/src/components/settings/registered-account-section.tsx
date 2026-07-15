import {
  ArgentIcon,
  Button,
  PlusIcon,
  SectionHeader,
  SettingsCard,
} from "@cartridge/controller-ui";
import { formatAddress } from "@cartridge/controller-ui/utils";
import { useAdvancedView } from "@/hooks/features";

export interface RegisteredAccount {
  accountName: string;
  accountAddress: string;
}

const registeredAccounts: RegisteredAccount[] = [
  {
    accountName: "clicksave.stark",
    accountAddress: "0x04183183013819381932139812918",
  },
];

export function RegisteredAccountSection() {
  const advancedView = useAdvancedView();

  return (
    <section className="space-y-4">
      <SectionHeader kind="registered-account" />
      <div className="space-y-3">
        {registeredAccounts.map((i) => (
          <SettingsCard
            icon={<ArgentIcon />}
            label={i.accountName}
            rightText={
              advancedView
                ? formatAddress(i.accountAddress, {
                    first: 4,
                    last: 4,
                  })
                : undefined
            }
            onDelete={async () => {}}
            confirm="delete"
            confirmLabel={i.accountName}
          />
        ))}
      </div>
      <Button variant="sans">
        <PlusIcon size="sm" variant="line" />
        Add Account
      </Button>
    </section>
  );
}
