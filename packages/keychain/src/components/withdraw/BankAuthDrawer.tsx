import { useMemo, useState } from "react";
import {
  CoinflowWithdraw,
  MerchantStyle,
  WithdrawSpeed,
  type CoinflowWithdrawProps,
  type MerchantTheme,
} from "@coinflowlabs/react";
import {
  Drawer,
  DrawerContent,
  PlusIcon,
  Skeleton,
} from "@cartridge/controller-ui";
import { useControllerTheme } from "@/hooks/connection";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useWithdrawContext } from "./provider";
import { SandboxWarning } from "./OverviewDrawer";

const COINFLOW_PRIMARY_FALLBACK = "#fbcb4a";

// Match Coinflow's hosted UI to the keychain surface, same as the on-ramp card
// form (checkout/coinflow/form.tsx).
const COINFLOW_THEME_BASE = {
  background: "#1e221f",
  backgroundAccent: "#242824",
  backgroundAccent2: "#242824",
  textColor: "#ffffff",
  textColorAccent: "#505050",
  textColorAction: "#ffffff",
  style: MerchantStyle.Sharp,
  fontSize: "12px",
} as const;

// v1 exposes the bank-deposit subset only (§ plan D3 / open question 2). Card
// speeds are a later follow-up; drive the whitelist off the destination's
// supportedSpeeds when a picker lands.
const ALLOWED_WITHDRAW_SPEEDS: WithdrawSpeed[] = [
  WithdrawSpeed.STANDARD,
  WithdrawSpeed.SAME_DAY,
];

interface BankAuthDrawerProps {
  isOpen: boolean;
  /** Cancels back to the amount step. */
  onClose: () => void;
  /** Coinflow sandbox is active — renders the standing sandbox warning. */
  sandbox?: boolean;
}

/**
 * The primary "Add Bank Account" path (design D4): Coinflow's hosted Bank
 * Authentication UI. Renders the SDK `CoinflowWithdraw` iframe, which does
 * Plaid bank-linking + card tokenization + destination creation entirely
 * inside Coinflow — no bank credentials touch our backend. A thin view (mirror
 * of checkout/coinflow/form.tsx): the session is minted + owned by
 * `WithdrawProvider` via `useCoinflowBankAuthSession()`; this drawer only reads
 * it and renders the iframe. On the iframe's success (the `accountLinked`
 * event) `bankAuth.onLinked()` refetches the status so the new destination
 * lists. The legacy raw-form `CreateBankAccountDrawer` is kept in the tree but
 * no longer wired.
 */
export function BankAuthDrawer({
  isOpen,
  onClose,
  sandbox,
}: BankAuthDrawerProps) {
  const { bankAuth } = useWithdrawContext();
  // The iframe reports its content height so the drawer can size to it
  // (handleHeightChange); before the first message a min-height keeps room for
  // the loader.
  const [height, setHeight] = useState<number>();

  const controllerTheme = useControllerTheme();
  const coinflowTheme = useMemo<MerchantTheme>(() => {
    const primary = controllerTheme?.colors?.primary;
    return {
      ...COINFLOW_THEME_BASE,
      primary:
        typeof primary === "string" ? primary : COINFLOW_PRIMARY_FALLBACK,
    };
  }, [controllerTheme]);

  const { session } = bankAuth;

  // Session-key auth with no on-chain wallet: `CoinflowWithdraw`'s prop union is
  // discriminated by blockchain and types wallet/connection as required, but the
  // hosted bank-auth UI is driven purely by the session key (matching the
  // on-ramp settlement chain, "solana"). Cast to satisfy the union — the iframe
  // never requests a transaction signature in this flow.
  const withdrawProps = useMemo(
    () =>
      session
        ? ({
            merchantId: session.merchantId,
            env: session.env,
            sessionKey: session.sessionKey,
            blockchain: "solana",
            theme: coinflowTheme,
            bankAccountLinkRedirect: window.location.href,
            allowedWithdrawSpeeds: ALLOWED_WITHDRAW_SPEEDS,
            onSuccess: () => {
              bankAuth.onLinked();
            },
            handleHeightChange: (h: string) => {
              const next = Number.parseInt(h, 10);
              if (Number.isFinite(next) && next > 0) setHeight(next);
            },
          } as unknown as CoinflowWithdrawProps)
        : undefined,
    [session, coinflowTheme, bankAuth],
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent
        title="Add Bank Account"
        icon={<PlusIcon variant="line" />}
      >
        {/* Always visible while sandbox is active, whatever the drawer state. */}
        {sandbox && <SandboxWarning />}

        {bankAuth.error ? (
          <ErrorAlert
            title="Unable to start bank linking"
            description={bankAuth.error.message}
          />
        ) : bankAuth.isMinting || !withdrawProps ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-40 w-full rounded" />
          </div>
        ) : (
          <div style={{ height: height ?? 480 }}>
            <CoinflowWithdraw {...withdrawProps} />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
