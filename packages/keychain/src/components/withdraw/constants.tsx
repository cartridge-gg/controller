import { BankIcon, CreditCardIcon } from "@cartridge/controller-ui";
import { WithdrawSpeed } from "@coinflowlabs/react";
import {
  CoinflowDestinationType,
  CoinflowPayoutSpeed,
  type CoinflowDestination,
} from "@/hooks/payments/coinflow-withdraw";

// Speeds offered to Coinflow's hosted Bank Authentication UI
// (the `allowedWithdrawSpeeds` prop).
// This whitelist is ONLY for the purpose of bank linking
export const ALLOWED_LINKING_SPEEDS: WithdrawSpeed[] = [
  // bank account
  // WithdrawSpeed.ASAP,
  // WithdrawSpeed.SAME_DAY,
  WithdrawSpeed.STANDARD,
  // WithdrawSpeed.WIRE,

  // debit card / apple play
  // WithdrawSpeed.CARD,
];

// Speeds the withdraw method picker actually renders a card for (see
// `DestinationCard`). Add every CoinflowPayoutSpeed here and uncomment the ones
// that are live; today only Standard is available.
export const AVAILABLE_SPEEDS: CoinflowPayoutSpeed[] = [
  // CoinflowPayoutSpeed.Asap,
  // CoinflowPayoutSpeed.SameDay,
  CoinflowPayoutSpeed.Standard,
  // CoinflowPayoutSpeed.Wire,
];

/**
 * Human-readable label + processing time per delivery speed. A destination
 * exposes one card per `supportedSpeeds` entry, and the card renders the
 * processing time so the user can weigh speed against the quoted fee.
 * https://docs.coinflow.cash/guides/payouts/beyond-payouts/understanding-payout-speeds
 * https://docs.coinflow.cash/guides/payouts/payout-methods/supported-payout-methods/overview#implementation
 */
export const SPEED_DISPLAY: Record<
  CoinflowPayoutSpeed,
  { label: string; processingTime: string }
> = {
  [CoinflowPayoutSpeed.Asap]: {
    label: "RTP",
    processingTime: "Within minutes",
  },
  [CoinflowPayoutSpeed.SameDay]: {
    label: "Same Day ACH",
    processingTime: "Same business day",
  },
  [CoinflowPayoutSpeed.Wire]: {
    label: "Wire Transfer",
    processingTime: "1-2 business days",
  },
  [CoinflowPayoutSpeed.Standard]: {
    label: "Standard ACH",
    processingTime: "2-3 business days",
  },
};

/**
 * Icon + label for a destination. Fee and ETA are no longer static copy — the
 * fee comes from the live quote and the processing time from the chosen speed
 * (see `SPEED_DISPLAY`). Only bank destinations can be linked in-app today;
 * the other types render if Coinflow returns them.
 */
export function getDestinationDisplay(destination: CoinflowDestination): {
  icon: React.ReactElement;
  title: string;
} {
  switch (destination.type) {
    case CoinflowDestinationType.Card:
      return {
        icon: <CreditCardIcon variant="solid" />,
        title: destination.display,
      };
    case CoinflowDestinationType.Bank:
      return {
        icon: <BankIcon />,
        title: destination.display,
      };
    default:
      return {
        icon: <BankIcon />,
        title: destination.display,
      };
  }
}
