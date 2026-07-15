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
  supportedSpeeds: [CoinflowPayoutSpeed.Standard],
};

const card = {
  type: CoinflowDestinationType.Card,
  token: "card-token-1",
  display: "Debit Card ****4242",
  supportedSpeeds: [CoinflowPayoutSpeed.Asap],
};

const baseProps = {
  isOpen: true,
  onClose: () => {},
  onSelect: () => {},
  destinations: [bank, card],
  credits: 613,
};

describe("WithdrawMethodDrawer", () => {
  it("renders the amount summary and every linked destination", () => {
    render(<WithdrawMethodDrawer {...baseProps} />);

    expect(screen.getByText("Withdrawal Amount")).toBeInTheDocument();
    expect(screen.getByText("$6.13")).toBeInTheDocument();
    expect(screen.getByText("Processing Fee")).toBeInTheDocument();
    expect(screen.getByText("Bank ****0283")).toBeInTheDocument();
    expect(screen.getByText("Debit Card ****4242")).toBeInTheDocument();
  });

  it("keeps the withdraw button disabled until a destination is highlighted", () => {
    const onSelect = vi.fn();
    render(<WithdrawMethodDrawer {...baseProps} onSelect={onSelect} />);

    const button = screen.getByText("Withdraw $6.13").closest("button")!;
    expect(button).toBeDisabled();
    // No selection yet — no "Transfer to:" summary either.
    expect(screen.queryByText("Transfer to:")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Bank ****0283"));
    expect(button).toBeEnabled();
    expect(screen.getByText("Transfer to:")).toBeInTheDocument();

    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(bank);
  });

  it("moves the highlight when another destination is clicked", () => {
    const onSelect = vi.fn();
    render(<WithdrawMethodDrawer {...baseProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("Bank ****0283"));
    fireEvent.click(screen.getByText("Debit Card ****4242"));

    fireEvent.click(screen.getByText("Withdraw $6.13").closest("button")!);
    expect(onSelect).toHaveBeenCalledWith(card);
  });

  it("seeds the highlight from the confirmed selection when re-opened", () => {
    render(<WithdrawMethodDrawer {...baseProps} selectedToken={card.token} />);

    expect(screen.getByText("Withdraw $6.13").closest("button")).toBeEnabled();
    // The display renders on the card and on the "Transfer to:" summary; the
    // card is the one carrying the pressed state.
    const highlighted = screen
      .getAllByText("Debit Card ****4242")[0]
      .closest('[role="button"]');
    expect(highlighted).toHaveAttribute("aria-pressed", "true");
  });
});
