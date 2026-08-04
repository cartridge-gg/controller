import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  CoinflowDestinationType,
  CoinflowPayoutSpeed,
} from "@/hooks/payments/coinflow-withdraw";
import { WithdrawMethodDrawer } from "./WithdrawMethodDrawer";

// The picker lists one card per offered *option* (type + speed), not per linked
// account. Bank account is offered at two speeds today (Standard + ASAP, see
// WITHDRAW_DESTINATIONS); the cards differ by their per-speed copy — the
// Standard card shows "1-2 business days", the ASAP card "Within minutes" (see
// WITHDRAW_SPEED_INFO). Selecting either quotes the linked bank at that speed.
const bank = {
  type: CoinflowDestinationType.Bank,
  token: "bank-token-1",
  display: "Bank ****0283",
  supportedSpeeds: [CoinflowPayoutSpeed.Standard],
};

const bank2 = {
  type: CoinflowDestinationType.Bank,
  token: "bank-token-2",
  display: "Bank ****9999",
  supportedSpeeds: [CoinflowPayoutSpeed.Standard],
};

const card = {
  type: CoinflowDestinationType.Card,
  token: "card-token-1",
  display: "Debit Card ****4242",
  supportedSpeeds: [CoinflowPayoutSpeed.Asap],
};

const quote = {
  amountCents: 613,
  feeCents: 25,
  netCents: 588,
  remainingLimitCents: null,
  eta: null,
};

const baseProps = {
  isOpen: true,
  onClose: () => {},
  onSelectMethod: () => {},
  destinations: [bank],
  credits: 613,
};

// Picks the Standard / ASAP bank card by its per-speed processing-time copy —
// clicking the copy bubbles to the card's onClick.
const selectStandard = () =>
  fireEvent.click(screen.getByText("1-2 business days"));
const selectAsap = () => fireEvent.click(screen.getByText("Within minutes"));

describe("WithdrawMethodDrawer", () => {
  it("renders one card per offered option (type + speed), not per linked account", () => {
    // A card destination is present but no card *option* is offered, so only the
    // two bank speed cards render.
    render(<WithdrawMethodDrawer {...baseProps} destinations={[bank, card]} />);

    expect(screen.getByText("Withdrawal Amount")).toBeInTheDocument();
    expect(screen.getByText("$6.13")).toBeInTheDocument();

    // Two bank options (Standard + ASAP) each render a "Bank Account" card,
    // differing by the per-speed copy — never an account number.
    expect(screen.getAllByText("Bank Account")).toHaveLength(2);
    expect(screen.getByText("1-2 business days")).toBeInTheDocument();
    expect(screen.getByText("Within minutes")).toBeInTheDocument();
    expect(screen.queryByText("Debit Card")).not.toBeInTheDocument();
  });

  it("quotes the selected option's linked account at that option's speed", () => {
    const onSelectMethod = vi.fn();
    render(
      <WithdrawMethodDrawer {...baseProps} onSelectMethod={onSelectMethod} />,
    );

    // Nothing auto-selects now that several options are offered.
    expect(onSelectMethod).not.toHaveBeenCalled();

    // Picking the Standard bank option quotes the linked bank at Standard…
    selectStandard();
    expect(onSelectMethod).toHaveBeenCalledWith({
      token: bank.token,
      speed: CoinflowPayoutSpeed.Standard,
    });

    // …and the ASAP option quotes the same account at Asap.
    selectAsap();
    expect(onSelectMethod).toHaveBeenLastCalledWith({
      token: bank.token,
      speed: CoinflowPayoutSpeed.Asap,
    });
  });

  it("quotes the first linked account when several of the type exist", () => {
    const onSelectMethod = vi.fn();
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        destinations={[bank, bank2]}
        onSelectMethod={onSelectMethod}
      />,
    );

    // Multi-account-per-type selection is not built yet — the first match wins.
    selectStandard();
    expect(onSelectMethod).toHaveBeenCalledWith({
      token: bank.token,
      speed: CoinflowPayoutSpeed.Standard,
    });
  });

  it("shows a Link Account button when nothing of the type is linked", () => {
    const onLink = vi.fn();
    const onResetSelection = vi.fn();
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        destinations={[]}
        onResetSelection={onResetSelection}
        onLink={onLink}
      />,
    );

    // Pick an option; with nothing linked it clears the quote and offers linking
    // — no Transfer-to row, but the fee row stays visible (defaulting to $0.00).
    selectStandard();
    expect(onResetSelection).toHaveBeenCalled();
    expect(screen.queryByText("Transfer to:")).not.toBeInTheDocument();
    expect(screen.getByText("Processing Fee")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Link Account"));
    expect(onLink).toHaveBeenCalledWith("bank-account");
  });

  it("keeps the withdraw button disabled until a quote resolves", () => {
    const { rerender, container } = render(
      <WithdrawMethodDrawer {...baseProps} />,
    );
    selectStandard();

    // Linked account but no quote yet → disabled, button shows the gross amount.
    expect(screen.getByText("Withdraw $6.13").closest("button")).toBeDisabled();

    // Quote still loading → still disabled and in its loading state (the label
    // is swapped for a spinner, so query the <button> directly); the fee row
    // also shows a spinner.
    rerender(<WithdrawMethodDrawer {...baseProps} quoteLoading />);
    expect(container.querySelector("button")).toBeDisabled();
    expect(screen.getByText("Calculating fee…")).toBeInTheDocument();

    // Quote resolved → enabled, button shows the net (received) amount.
    rerender(<WithdrawMethodDrawer {...baseProps} quote={quote} />);
    expect(screen.getByText("Withdraw $5.88").closest("button")).toBeEnabled();
  });

  it("shows the quoted fee and the linked account on the confirmation rows", () => {
    render(<WithdrawMethodDrawer {...baseProps} quote={quote} />);
    selectStandard();

    // Fee lands on the Processing Fee row (not the card).
    expect(screen.getByText("Processing Fee")).toBeInTheDocument();
    expect(screen.getByText("$0.25")).toBeInTheDocument();
    // The Transfer-to row names the specific linked account.
    expect(screen.getByText("Transfer to:")).toBeInTheDocument();
    expect(screen.getByText("Bank ****0283")).toBeInTheDocument();
  });

  it("surfaces a quote error on the processing-fee row", () => {
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        quoteError={new Error("temporarily unavailable")}
      />,
    );
    selectStandard();

    expect(screen.getByText("Unable to calculate fee")).toBeInTheDocument();
    expect(screen.getByText("Withdraw $6.13").closest("button")).toBeDisabled();
  });

  it("initiates the withdrawal when the button is clicked with a resolved quote", () => {
    const onWithdraw = vi.fn();
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        quote={quote}
        onWithdraw={onWithdraw}
      />,
    );
    selectStandard();

    fireEvent.click(screen.getByText("Withdraw $5.88"));
    expect(onWithdraw).toHaveBeenCalledTimes(1);
  });

  it("disables the button while the withdrawal is submitting", () => {
    const { container } = render(
      <WithdrawMethodDrawer {...baseProps} quote={quote} isSubmitting />,
    );
    selectStandard();

    // A resolved quote would otherwise enable it; the in-flight submit holds it
    // disabled (its label is swapped for a spinner while loading, so query the
    // <button> directly — the cards are role="button" divs).
    expect(container.querySelector("button")).toBeDisabled();
  });

  it("renders the submit error above the button", () => {
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        quote={quote}
        submitError={new Error("insufficient balance")}
      />,
    );
    selectStandard();

    expect(screen.getByText("Withdrawal failed")).toBeInTheDocument();
    expect(screen.getByText("insufficient balance")).toBeInTheDocument();
  });
});
