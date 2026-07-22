import {
  BankIcon,
  Button,
  CreditCardIcon,
  PlusIcon,
  SectionHeader,
  SettingsCard,
} from "@cartridge/controller-ui";
import {
  CoinflowDestinationType,
  useCoinflowWithdrawStatus,
} from "@/hooks/payments/coinflow-withdraw";
import { useWithdrawContext } from "@/components/withdraw/provider";

/**
 * Lists the user's Coinflow-linked payout destinations (bank accounts / cards)
 * as read-only rows. Mirrors the other settings sections: a `SectionHeader`
 * followed by `SettingsCard` rows and an add affordance. Visibility follows the
 * withdraw flow's `withdrawHidden` gate (the "coinflow-payouts" flag), so the
 * section only appears where payouts are enabled. "Add Payment Method" runs the
 * withdraw flow's verification → KYC → hosted bank-link gauntlet in "add-bank"
 * intent (`initiateAddBank`); the newly linked account lands in this list via
 * the shared status query. The unlink action is not wired up yet.
 */
export function BankAccountSection() {
  const { withdrawHidden, withdrawDisabled, initiateAddBank } =
    useWithdrawContext();
  // Destinations ride along on the withdraw-status query; only fetch it while
  // the section is shown. The withdraw flow observes the same query key, so a
  // freshly linked account refetches into this list automatically.
  const { data: status, isLoading } = useCoinflowWithdrawStatus({
    enabled: !withdrawHidden,
  });

  if (withdrawHidden) return null;

  const destinations = status?.destinations ?? [];

  return (
    <section className="space-y-4">
      <SectionHeader kind="bank-account" isLoading={isLoading} />
      <div className="space-y-3 flex flex-col">
        {destinations.map((destination) => (
          <SettingsCard
            key={destination.token}
            icon={
              destination.type === CoinflowDestinationType.Card ? (
                <CreditCardIcon variant="solid" />
              ) : (
                <BankIcon />
              )
            }
            label={destination.display}
          />
        ))}
        <Button
          variant="sans"
          onClick={initiateAddBank}
          disabled={withdrawDisabled || isLoading}
        >
          <PlusIcon size="sm" variant="line" />
          Add Payment Method
        </Button>
      </div>
    </section>
  );
}
