import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  CoinflowDestinationType,
  CoinflowPayoutSpeed,
} from "@/hooks/payments/coinflow-withdraw";
import { WithdrawMethodDrawer } from "./WithdrawMethodDrawer";

// Standard is the only live speed (see AVAILABLE_SPEEDS): SameDay/Asap on these
// fixtures are dropped by the picker, so they double as filtering fixtures.
const bank = {
  type: CoinflowDestinationType.Bank,
  token: "bank-token-1",
  display: "Bank ****0283",
  supportedSpeeds: [CoinflowPayoutSpeed.Standard, CoinflowPayoutSpeed.SameDay],
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
  destinations: [bank, bank2, card],
  credits: 613,
};

describe("WithdrawMethodDrawer", () => {
  it("renders one card per allowed (destination, speed), filtering out unavailable speeds", () => {
    render(<WithdrawMethodDrawer {...baseProps} />);

    expect(screen.getByText("Withdrawal Amount")).toBeInTheDocument();
    expect(screen.getByText("$6.13")).toBeInTheDocument();
    expect(screen.getByText("Processing Fee")).toBeInTheDocument();

    // Only Standard is live: the two banks each yield one Standard card; the
    // bank's Same Day speed and the card's Asap speed are dropped entirely.
    expect(screen.getByText("Bank ****0283")).toBeInTheDocument();
    expect(screen.getByText("Bank ****9999")).toBeInTheDocument();
    expect(screen.getAllByText("Standard ACH")).toHaveLength(2);
    expect(screen.queryByText("Same Day ACH")).not.toBeInTheDocument();
    expect(screen.queryByText("Debit Card ****4242")).not.toBeInTheDocument();
  });

  it("picks a destination + speed when a card is clicked", () => {
    const onSelectMethod = vi.fn();
    render(
      <WithdrawMethodDrawer {...baseProps} onSelectMethod={onSelectMethod} />,
    );

    fireEvent.click(screen.getByText("Bank ****9999"));
    expect(onSelectMethod).toHaveBeenCalledWith({
      token: bank2.token,
      speed: CoinflowPayoutSpeed.Standard,
    });
  });

  it("auto-selects when only one card is available", () => {
    const onSelectMethod = vi.fn();
    // The card destination has no live speed, so a lone bank is the only card.
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        destinations={[bank, card]}
        onSelectMethod={onSelectMethod}
      />,
    );

    expect(onSelectMethod).toHaveBeenCalledWith({
      token: bank.token,
      speed: CoinflowPayoutSpeed.Standard,
    });
  });

  it("does not auto-select when more than one card is available", () => {
    const onSelectMethod = vi.fn();
    render(
      <WithdrawMethodDrawer {...baseProps} onSelectMethod={onSelectMethod} />,
    );

    expect(onSelectMethod).not.toHaveBeenCalled();
  });

  it("keeps the withdraw button disabled until a quote resolves", () => {
    const { rerender } = render(<WithdrawMethodDrawer {...baseProps} />);

    // No selection, no quote → disabled, button shows the gross amount.
    expect(screen.getByText("Withdraw $6.13").closest("button")).toBeDisabled();

    // Selection made but quote still loading → still disabled.
    rerender(
      <WithdrawMethodDrawer
        {...baseProps}
        selection={{ token: bank.token, speed: CoinflowPayoutSpeed.Standard }}
        quoteLoading
      />,
    );
    expect(screen.getByText("Withdraw $6.13").closest("button")).toBeDisabled();
    expect(screen.getByText("Calculating fee…")).toBeInTheDocument();

    // Quote resolved → enabled, button shows the net (received) amount.
    rerender(
      <WithdrawMethodDrawer
        {...baseProps}
        selection={{ token: bank.token, speed: CoinflowPayoutSpeed.Standard }}
        quote={quote}
      />,
    );
    expect(screen.getByText("Withdraw $5.88").closest("button")).toBeEnabled();
  });

  it("shows the quoted fee on the processing-fee row", () => {
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        selection={{ token: bank.token, speed: CoinflowPayoutSpeed.Standard }}
        quote={quote}
      />,
    );

    // Fee lands on the Processing Fee row (not the card).
    expect(screen.getByText("$0.25")).toBeInTheDocument();
    // The confirmation summary names the destination + chosen speed.
    expect(screen.getByText("Transfer to:")).toBeInTheDocument();
  });

  it("surfaces a quote error on the processing-fee row", () => {
    render(
      <WithdrawMethodDrawer
        {...baseProps}
        selection={{ token: bank.token, speed: CoinflowPayoutSpeed.Standard }}
        quoteError={new Error("temporarily unavailable")}
      />,
    );

    expect(screen.getByText("Unable to calculate fee")).toBeInTheDocument();
    expect(screen.getByText("Withdraw $6.13").closest("button")).toBeDisabled();
  });
});
