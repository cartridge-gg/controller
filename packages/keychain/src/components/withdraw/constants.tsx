import {
  BankIcon,
  CreditCardIcon,
  type WithdrawDestinationKind,
} from "@cartridge/controller-ui";
import { WithdrawSpeed } from "@coinflowlabs/react";
import {
  CoinflowDestinationType,
  CoinflowPayoutSpeed,
  type CoinflowDestination,
} from "@/hooks/payments/coinflow-withdraw";

/**
 * Everything the withdraw flow needs to know about a single destination *option*
 * the method picker offers — one entry per `WITHDRAW_DESTINATIONS` element. A
 * `kind` may appear more than once (e.g. the same type at different speeds), so
 * this is a list rather than a map keyed by kind:
 *
 * - `id`: stable identifier for this option (kind + speed). Used as the card's
 *   React key and the picker's selection key, since a kind is no longer unique.
 * - `kind`: the destination *type* this option belongs to — drives the card's
 *   title/icon and the link flow.
 * - `withdrawSpeed`: the `@coinflowlabs/react` speed handed to Coinflow's hosted
 *   Bank Authentication UI (`allowedWithdrawSpeeds`) when linking — must line up
 *   with `coinflowPayoutSpeed`.
 * - `coinflowDestinationType`: how the kind maps onto a live Coinflow
 *   destination — used to find a linked account of the selected option.
 * - `coinflowPayoutSpeed`: the speed the option is quoted / withdrawn at (bank
 *   account settles Standard ACH today).
 */
export interface WithdrawDestinationConfig {
  id: string;
  kind: WithdrawDestinationKind;
  withdrawSpeed: WithdrawSpeed;
  coinflowDestinationType: CoinflowDestinationType;
  coinflowPayoutSpeed: CoinflowPayoutSpeed;
}

/**
 * The destination options the method picker offers today — one
 * `WithdrawDestinationCard` per entry, regardless of whether an account of that
 * kind is linked yet. Commented-out entries are not available yet; uncomment to
 * offer them (and add a matching speed to bank linking if applicable).
 */
export const WITHDRAW_DESTINATIONS: WithdrawDestinationConfig[] = [
  {
    id: "bank-account-standard",
    kind: "bank-account",
    withdrawSpeed: WithdrawSpeed.STANDARD,
    coinflowDestinationType: CoinflowDestinationType.Bank,
    coinflowPayoutSpeed: CoinflowPayoutSpeed.Standard,
  },
  {
    id: "bank-account-asap",
    kind: "bank-account",
    withdrawSpeed: WithdrawSpeed.ASAP,
    coinflowDestinationType: CoinflowDestinationType.Bank,
    coinflowPayoutSpeed: CoinflowPayoutSpeed.Asap,
  },
  // Not available yet — uncomment to offer these destinations:
  // {
  //   id: "card-instant",
  //   kind: "card",
  //   withdrawSpeed: WithdrawSpeed.CARD,
  //   coinflowDestinationType: CoinflowDestinationType.Card,
  //   coinflowPayoutSpeed: CoinflowPayoutSpeed.Asap,
  // },
  // {
  //   id: "venmo-instant",
  //   kind: "venmo",
  //   withdrawSpeed: WithdrawSpeed.ASAP,
  //   coinflowDestinationType: CoinflowDestinationType.Venmo,
  //   coinflowPayoutSpeed: CoinflowPayoutSpeed.Asap,
  // },
  // {
  //   id: "paypal-instant",
  //   kind: "paypal",
  //   withdrawSpeed: WithdrawSpeed.ASAP,
  //   coinflowDestinationType: CoinflowDestinationType.Paypal,
  //   coinflowPayoutSpeed: CoinflowPayoutSpeed.Asap,
  // },
];

/**
 * Speeds offered to Coinflow's hosted Bank Authentication UI (the
 * `allowedWithdrawSpeeds` prop). ONLY for bank linking — derived from the
 * offered options' `withdrawSpeed`, deduped.
 */
export const ALLOWED_LINKING_SPEEDS: WithdrawSpeed[] = [
  ...new Set(WITHDRAW_DESTINATIONS.map((d) => d.withdrawSpeed)),
];

/**
 * Card display copy per withdraw *speed* — `fees` and `processingTime` shown on
 * the `WithdrawDestinationCard`. A kind can be offered at more than one speed
 * (e.g. bank Standard vs ASAP), so the cards differ by speed, not by kind.
 *
 * TODO: mock values — replace with real per-speed fee/ETA copy (or a live
 * quote) once available.
 */
export interface WithdrawSpeedInfo {
  fees: string;
  processingTime: string;
}

export const WITHDRAW_SPEED_INFO: Record<WithdrawSpeed, WithdrawSpeedInfo> = {
  [WithdrawSpeed.STANDARD]: {
    fees: "No fees",
    processingTime: "1-2 business days",
  },
  [WithdrawSpeed.ASAP]: {
    fees: "Variable fees",
    processingTime: "Within minutes",
  },
  [WithdrawSpeed.SAME_DAY]: {
    fees: "Variable fees",
    processingTime: "Same business day",
  },
  [WithdrawSpeed.CARD]: {
    fees: "Variable fees",
    processingTime: "Same business day",
  },
  [WithdrawSpeed.IBAN]: {
    fees: "Variable fees",
    processingTime: "1-2 business days",
  },
  [WithdrawSpeed.PIX]: {
    fees: "Variable fees",
    processingTime: "Within minutes",
  },
  [WithdrawSpeed.EFT]: {
    fees: "Variable fees",
    processingTime: "1-2 business days",
  },
  [WithdrawSpeed.VENMO]: {
    fees: "Variable fees",
    processingTime: "Same business day",
  },
  [WithdrawSpeed.PAYPAL]: {
    fees: "Variable fees",
    processingTime: "Same business day",
  },
  [WithdrawSpeed.WIRE]: {
    fees: "Variable fees",
    processingTime: "Same business day",
  },
  [WithdrawSpeed.INTERAC]: {
    fees: "Variable fees",
    processingTime: "Within minutes",
  },
};

export function getDestinationIcon(
  destination: CoinflowDestination,
): React.ReactElement {
  switch (destination.type) {
    case CoinflowDestinationType.Card:
      return <CreditCardIcon variant="solid" />;
    case CoinflowDestinationType.Bank:
    default:
      return <BankIcon />;
  }
}
