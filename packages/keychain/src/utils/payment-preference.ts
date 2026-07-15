export type PaymentPreference = "controller" | "credits" | "coinflow";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const PREFIX = "@cartridge/lastPaymentMethod:v2";
const LEGACY_PREFIX = "@cartridge/lastPaymentMethod";

const isPaymentPreference = (
  value: string | null,
): value is PaymentPreference =>
  value === "controller" || value === "credits" || value === "coinflow";

export function paymentPreferenceKey(origin: string, chainId: string): string {
  return `${PREFIX}:${encodeURIComponent(origin)}:${chainId}`;
}

export function readPaymentPreference({
  origin,
  chainId,
  configuredDefault,
  storage = localStorage,
}: {
  origin: string;
  chainId: string;
  configuredDefault: boolean;
  storage?: StorageLike;
}): PaymentPreference | undefined {
  if (!origin) return undefined;

  const key = paymentPreferenceKey(origin, chainId);
  const scoped = storage.getItem(key);
  if (isPaymentPreference(scoped)) return scoped;
  if (scoped !== null) storage.removeItem(key);

  // A configured game must not inherit another game's chain-global choice.
  if (configuredDefault) return undefined;

  const legacy = storage.getItem(`${LEGACY_PREFIX}:${chainId}`);
  if (legacy !== "credits" && legacy !== "coinflow") return undefined;

  storage.setItem(key, legacy);
  return legacy;
}

export function writePaymentPreference({
  origin,
  chainId,
  method,
  storage = localStorage,
}: {
  origin: string;
  chainId: string;
  method: PaymentPreference;
  storage?: StorageLike;
}): void {
  if (!origin) return;
  storage.setItem(paymentPreferenceKey(origin, chainId), method);
}

export function clearPaymentPreference({
  origin,
  chainId,
  storage = localStorage,
}: {
  origin: string;
  chainId: string;
  storage?: StorageLike;
}): void {
  if (!origin) return;
  storage.removeItem(paymentPreferenceKey(origin, chainId));
}

export type FundingResolution =
  | "pending"
  | "funded"
  | "exhausted"
  | "indeterminate";

export type CreditsResolution = "pending" | "available" | "unavailable";

export type InitialPaymentResolution =
  | { status: "pending" }
  | {
      status: "resolved";
      method: PaymentPreference;
      showMethodPicker?: boolean;
    };

/**
 * Resolve the initial bundle payment rail without side effects. The caller is
 * responsible for applying the result once per checkout.
 */
export function resolveInitialPaymentMethod({
  remembered,
  configuredDefault,
  funding,
  credits,
  hasSufficientCredits,
  cardTopupAvailable,
  directCardAvailable,
}: {
  remembered?: PaymentPreference;
  configuredDefault: boolean;
  funding: FundingResolution;
  credits: CreditsResolution;
  hasSufficientCredits: boolean;
  cardTopupAvailable: boolean;
  directCardAvailable: boolean;
}): InitialPaymentResolution {
  if (remembered === "controller") {
    return { status: "resolved", method: "controller" };
  }

  if (remembered === "coinflow") {
    return directCardAvailable
      ? { status: "resolved", method: "coinflow" }
      : {
          status: "resolved",
          method: "controller",
          showMethodPicker: true,
        };
  }

  if (remembered === "credits") {
    if (credits === "pending") return { status: "pending" };
    if (
      credits === "available" &&
      (hasSufficientCredits || cardTopupAvailable)
    ) {
      return { status: "resolved", method: "credits" };
    }
    return {
      status: "resolved",
      method: "controller",
      showMethodPicker: true,
    };
  }

  if (!configuredDefault) {
    return { status: "resolved", method: "controller" };
  }

  if (funding === "pending") return { status: "pending" };
  if (funding === "funded") {
    return { status: "resolved", method: "controller" };
  }
  if (credits === "pending") return { status: "pending" };
  if (credits === "available" && (hasSufficientCredits || cardTopupAvailable)) {
    return { status: "resolved", method: "credits" };
  }
  return {
    status: "resolved",
    method: "controller",
    showMethodPicker: true,
  };
}
