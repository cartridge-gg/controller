import { useEffect, useMemo, useRef, useState } from "react";
import {
  CoinflowWithdraw,
  type CoinflowWithdrawProps,
} from "@coinflowlabs/react";
import { Drawer, DrawerContent, PlusIcon } from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ConfirmingTransaction } from "@/components/purchase/pending/confirming-transaction";
import { useWithdrawContext } from "./provider";
import { SandboxWarning } from "./OverviewDrawer";
import { useCoinflowTheme } from "./coinflow-theme";
import { ALLOWED_LINKING_SPEEDS } from "./constants";

const IFRAME_HEIGHT = 500;

// Coinflow posts iframe events from its own origin (mirrors the SDK's own
// origin check in CoinflowIFrame). We only run `sandbox`/`prod`.
const COINFLOW_ORIGIN: Record<"prod" | "sandbox", string> = {
  prod: "https://coinflow.cash",
  sandbox: "https://sandbox.coinflow.cash",
};

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
 * it and renders the iframe. Coinflow's SDK has NO callback for a linked bank —
 * its message switch no-ops on the `accountLinked` event and only invokes
 * `onSuccess` for a completed *withdrawal* — so we listen for that raw
 * postMessage ourselves and call `bankAuth.onLinked()` to refetch the status so
 * the new destination lists. The legacy raw-form `CreateBankAccountDrawer` is
 * kept in the tree but no longer wired.
 */
export function BankAuthDrawer({
  isOpen,
  onClose,
  sandbox,
}: BankAuthDrawerProps) {
  const { bankAuth } = useWithdrawContext();
  const { session } = bankAuth;

  const coinflowTheme = useCoinflowTheme();
  const [height, setHeight] = useState(IFRAME_HEIGHT);

  // Session-key auth with no on-chain wallet: `CoinflowWithdraw`'s prop union is
  // discriminated by blockchain and types wallet/connection as required, but the
  // hosted bank-auth UI is driven purely by the session key (matching the
  // on-ramp settlement chain, "solana"). Cast to satisfy the union — the iframe
  // never requests a transaction signature in this flow.
  // https://github.com/coinflow-labs-us/coinflow-react#withdraw-usage
  const withdrawProps = useMemo(
    () =>
      session
        ? ({
            merchantId: session.merchantId,
            env: session.env,
            sessionKey: session.sessionKey,
            blockchain: "solana",
            theme: coinflowTheme,
            // do not allow to withdraw
            amount: 0,
            lockAmount: true,
            // Deliberately NOT passing `bankAccountLinkRedirect`: supplying it
            // opts the bank-link into Coinflow's redirect flow, where the SDK
            // reacts to the iframe's `redirect` message with
            // `window.open(url, "_blank")` and hands off to that URL to finish
            // setup — popping a second tab. Omitting it keeps the entire link
            // inside the iframe. Link completion is handled by the
            // `accountLinked` listener below, not `onSuccess` (which the SDK
            // only fires for a completed withdrawal).
            allowedWithdrawSpeeds: ALLOWED_LINKING_SPEEDS,
            handleHeightChange: (h: string) => {
              const next = Number.parseInt(h, 10);
              if (Number.isFinite(next) && next > 0) setHeight(next);
            },
          } as unknown as CoinflowWithdrawProps)
        : undefined,
    [session, coinflowTheme],
  );

  // Coinflow's SDK swallows the `accountLinked` event (no callback prop exists),
  // so we listen for the raw postMessage ourselves — the same message its own
  // handler receives and ignores — and treat it as link-complete. Guard against
  // a duplicate event firing `onLinked` twice before the step unmounts.
  const linkedRef = useRef(false);
  const onLinked = bankAuth.onLinked;
  useEffect(() => {
    const env = session?.env;
    if (!env) return;
    linkedRef.current = false;
    const expectedOrigin = COINFLOW_ORIGIN[env];
    const handler = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return;
      if (typeof event.data !== "string") return;
      let method: string | undefined;
      try {
        method = JSON.parse(event.data)?.method;
      } catch {
        return;
      }
      if (method === "accountLinked" && !linkedRef.current) {
        linkedRef.current = true;
        onLinked();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [session?.env, onLinked]);

  const isError = !!bankAuth.error;
  // Two distinct processing phases bookend the iframe, each with its own
  // message: `isPreparing` before it (minting the session / booting the iframe)
  // and `isLinking` after (holding from the iframe's success event until the
  // linked destination lands in the refetched status, so the drawer never
  // flashes an empty picker mid-navigation).
  const isPreparing = bankAuth.isMinting || !withdrawProps;
  const isLinking = bankAuth.isLinking;
  const isIframe = !isError && !isPreparing && !isLinking;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      className="gap-4"
      showClose={!isIframe || height < IFRAME_HEIGHT}
    >
      {isIframe ? (
        <div style={{ height: IFRAME_HEIGHT }}>
          <CoinflowWithdraw {...withdrawProps} />
        </div>
      ) : (
        <DrawerContent
          title="Add Bank Account"
          icon={<PlusIcon variant="line" />}
        >
          {sandbox && <SandboxWarning />}
          {isError && (
            <ErrorAlert
              title="Unable to start bank linking"
              description={bankAuth.error!.message}
            />
          )}
          {isPreparing && (
            <ConfirmingTransaction
              title={"Preparing bank authorization..."}
              status="loading"
            />
          )}
          {isLinking && (
            <ConfirmingTransaction
              title={"Adding your bank account..."}
              status="loading"
            />
          )}
        </DrawerContent>
      )}
    </Drawer>
  );
}
