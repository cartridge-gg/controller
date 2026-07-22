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
 * Everything the withdraw flow needs to know about a destination *kind*, in one
 * place — one entry per `WithdrawDestinationKind`:
 *
 * - `allowed`: the method picker offers this kind today (renders one
 *   `WithdrawDestinationCard`) and its `withdrawSpeed` is whitelisted for bank
 *   linking. Flip to `true` as a kind goes live.
 * - `withdrawSpeed`: the `@coinflowlabs/react` speed handed to Coinflow's hosted
 *   Bank Authentication UI (`allowedWithdrawSpeeds`) when linking — must line up
 *   with `coinflowPayoutSpeed`.
 * - `coinflowDestinationType`: how the kind maps onto a live Coinflow
 *   destination — used to find a linked account of the selected kind.
 * - `coinflowPayoutSpeed`: the speed the kind is quoted / withdrawn at (bank
 *   account settles Standard ACH today).
 */
export interface WithdrawDestinationConfig {
  allowed: boolean;
  withdrawSpeed: WithdrawSpeed;
  coinflowDestinationType: CoinflowDestinationType;
  coinflowPayoutSpeed: CoinflowPayoutSpeed;
}

export const WITHDRAW_DESTINATIONS: Record<
  WithdrawDestinationKind,
  WithdrawDestinationConfig
> = {
  "bank-account": {
    allowed: true,
    withdrawSpeed: WithdrawSpeed.STANDARD,
    coinflowDestinationType: CoinflowDestinationType.Bank,
    coinflowPayoutSpeed: CoinflowPayoutSpeed.Standard,
  },
  card: {
    allowed: false,
    withdrawSpeed: WithdrawSpeed.CARD,
    coinflowDestinationType: CoinflowDestinationType.Card,
    coinflowPayoutSpeed: CoinflowPayoutSpeed.Asap,
  },
  venmo: {
    allowed: false,
    withdrawSpeed: WithdrawSpeed.ASAP,
    coinflowDestinationType: CoinflowDestinationType.Venmo,
    coinflowPayoutSpeed: CoinflowPayoutSpeed.Asap,
  },
  paypal: {
    allowed: false,
    withdrawSpeed: WithdrawSpeed.ASAP,
    coinflowDestinationType: CoinflowDestinationType.Paypal,
    coinflowPayoutSpeed: CoinflowPayoutSpeed.Asap,
  },
};

/**
 * The destination *kinds* the method picker offers today — one
 * `WithdrawDestinationCard` per entry, regardless of whether an account of that
 * kind is linked yet. Derived from the `allowed` flag above.
 */
export const ALLOWED_DESTINATION_KINDS = (
  Object.keys(WITHDRAW_DESTINATIONS) as WithdrawDestinationKind[]
).filter((kind) => WITHDRAW_DESTINATIONS[kind].allowed);

/**
 * Speeds offered to Coinflow's hosted Bank Authentication UI (the
 * `allowedWithdrawSpeeds` prop). ONLY for bank linking — derived from the
 * allowed kinds' `withdrawSpeed`, deduped.
 */
export const ALLOWED_LINKING_SPEEDS: WithdrawSpeed[] = [
  ...new Set(
    ALLOWED_DESTINATION_KINDS.map(
      (kind) => WITHDRAW_DESTINATIONS[kind].withdrawSpeed,
    ),
  ),
];

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
