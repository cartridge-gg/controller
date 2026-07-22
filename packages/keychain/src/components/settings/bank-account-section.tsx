import {
  BankIcon,
  Button,
  CreditCardIcon,
  PlusIcon,
  SectionHeader,
  SettingsCard,
} from "@cartridge/controller-ui";
import { useFeature } from "@/hooks/features";
import {
  CoinflowDestinationType,
  useCoinflowWithdrawStatus,
} from "@/hooks/payments/coinflow-withdraw";

/**
 * Lists the user's Coinflow-linked payout destinations (bank accounts / cards)
 * as read-only rows. Mirrors the other settings sections: a `SectionHeader`
 * followed by `SettingsCard` rows and an add affordance. Gated behind the same
 * "coinflow-payouts" flag as the withdraw flow, so it only appears where
 * payouts are enabled. The unlink action and the "Add Payment Method" button
 * are not wired up yet.
 */
export function BankAccountSection() {
  const payoutsEnabled = useFeature("coinflow-payouts");
  // Destinations ride along on the withdraw-status query; only fetch it when
  // the section is actually shown.
  const { data: status, isLoading } = useCoinflowWithdrawStatus({
    enabled: payoutsEnabled,
  });

  if (!payoutsEnabled) return null;

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
        {/* Placeholder — linking a new payment method is implemented later. */}
        <Button variant="sans" disabled>
          <PlusIcon size="sm" variant="line" />
          Add Payment Method
        </Button>
      </div>
    </section>
  );
}
