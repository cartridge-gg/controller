import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  CoinflowDestinationType,
  CoinflowPayoutSpeed,
} from "@/hooks/payments/coinflow-withdraw";
import { WithdrawMethodDrawer } from "./WithdrawMethodDrawer";

const bank = {
  type: CoinflowDestinationType.Bank,
  token: "bank-token-1",
  display: "Bank ****0283",
  supportedSpeeds: [CoinflowPayoutSpeed.Standard, CoinflowPayoutSpeed.SameDay],
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
  destinations: [bank, card],
  credits: 613,
};

describe("WithdrawMethodDrawer", () => {
  it("renders one card per (destination, speed) with its processing time", () => {
    render(<WithdrawMethodDrawer {...baseProps} />);

    expect(screen.getByText("Withdrawal Amount")).toBeInTheDocument();
    expect(screen.getByText("$6.13")).toBeInTheDocument();
    expect(screen.getByText("Processing Fee")).toBeInTheDocument();

    // Bank supports two speeds → two cards; card supports one → one card.
    expect(screen.getAllByText("Bank ****0283")).toHaveLength(2);
    expect(screen.getByText("Debit Card ****4242")).toBeInTheDocument();

    // Speed labels + processing times render per card.
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("Same Day")).toBeInTheDocument();
    expect(screen.getByText("3-5 business days")).toBeInTheDocument();
    expect(screen.getByText("Within minutes")).toBeInTheDocument();
  });

  it("picks a destination + speed when a card is clicked", () => {
    const onSelectMethod = vi.fn();
    render(
      <WithdrawMethodDrawer {...baseProps} onSelectMethod={onSelectMethod} />,
    );

    fireEvent.click(screen.getByText("Same Day"));
    expect(onSelectMethod).toHaveBeenCalledWith({
      token: bank.token,
      speed: CoinflowPayoutSpeed.SameDay,
    });
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

    expect(screen.getByText("Couldn't load fee")).toBeInTheDocument();
    expect(screen.getByText("Withdraw $6.13").closest("button")).toBeDisabled();
  });
});
