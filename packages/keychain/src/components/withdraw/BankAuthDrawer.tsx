import { useMemo, useState } from "react";
import {
  CoinflowWithdraw,
  WithdrawSpeed,
  type CoinflowWithdrawProps,
} from "@coinflowlabs/react";
import {
  Drawer,
  DrawerContent,
  PlusIcon,
  Skeleton,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useWithdrawContext } from "./provider";
import { SandboxWarning } from "./OverviewDrawer";
import { useCoinflowTheme } from "./coinflow-theme";

// v1 exposes the bank-deposit subset only (§ plan D3 / open question 2). Card
// speeds are a later follow-up; drive the whitelist off the destination's
// supportedSpeeds when a picker lands.
const ALLOWED_WITHDRAW_SPEEDS: WithdrawSpeed[] = [
  // bank account
  WithdrawSpeed.SAME_DAY,
  WithdrawSpeed.STANDARD,
  WithdrawSpeed.WIRE,
  WithdrawSpeed.ASAP,
  // debit card / apple play
  // WithdrawSpeed.CARD,
 ];

const MAX_HEIGHT = 500;

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
  const { session } = bankAuth;

  const coinflowTheme = useCoinflowTheme();
  const [height, setHeight] = useState(MAX_HEIGHT);

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

  const isError = !!bankAuth.error;
  const isLoading = bankAuth.isMinting || !withdrawProps;
  const isIframe = !isError && !isLoading;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      className="gap-4"
      showClose={!isIframe || height < MAX_HEIGHT}
    >
      {!isIframe ? (
        <DrawerContent
          title="Add Bank Account"
          icon={<PlusIcon variant="line" />}
        >
          {/* Always visible while sandbox is active, whatever the drawer state. */}
          {sandbox && <SandboxWarning />}

          {isError && (
            <ErrorAlert
              title="Unable to start bank linking"
              description={bankAuth.error!.message}
            />
          )}

          {isLoading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-40 w-full rounded" />
            </div>
          )}
        </DrawerContent>
      ) : (
        <div style={{ height: MAX_HEIGHT }}>
          <CoinflowWithdraw {...withdrawProps} />
        </div>
      )}
    </Drawer>
  );
}
