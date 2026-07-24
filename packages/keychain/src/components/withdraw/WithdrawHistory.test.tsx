import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CoinflowPayoutSpeed,
  CoinflowWithdrawalStatus,
  type CoinflowWithdrawal,
} from "@/hooks/payments/coinflow-withdraw";
import { WithdrawHistory } from "./WithdrawHistory";

const withdrawal: CoinflowWithdrawal = {
  id: "wd_1",
  status: CoinflowWithdrawalStatus.Processing,
  amountCents: 600,
  feeCents: 12,
  netCents: 588,
  method: CoinflowPayoutSpeed.Standard,
  effectiveSpeed: null,
  destinationDisplay: "Bank ****0283",
  failureCode: null,
  failureReason: null,
  createdAt: "2026-07-24T18:00:00Z",
  updatedAt: "2026-07-24T18:00:00Z",
  reversedAt: null,
};

describe("WithdrawHistory", () => {
  it("renders the empty placeholder when there are no withdrawals", () => {
    render(<WithdrawHistory />);

    expect(screen.getByText("History")).toBeInTheDocument();
    expect(
      screen.getByText("You have not made any withdrawals"),
    ).toBeInTheDocument();
  });

  it("renders the empty placeholder for an empty list", () => {
    render(<WithdrawHistory withdrawals={[]} />);

    expect(
      screen.getByText("You have not made any withdrawals"),
    ).toBeInTheDocument();
  });

  it("renders a withdrawal as a card with amount + status", () => {
    render(<WithdrawHistory withdrawals={[withdrawal]} />);

    expect(screen.getByText("Bank ****0283")).toBeInTheDocument();
    // Gross amount, not net — matches the mock's $6.00.
    expect(screen.getByText("$6.00")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(
      screen.queryByText("You have not made any withdrawals"),
    ).not.toBeInTheDocument();
  });

  it("renders only the two most recent withdrawals", () => {
    render(
      <WithdrawHistory
        withdrawals={[
          { ...withdrawal, id: "wd_3", destinationDisplay: "Bank ****0001" },
          { ...withdrawal, id: "wd_2", destinationDisplay: "Bank ****0002" },
          { ...withdrawal, id: "wd_1", destinationDisplay: "Bank ****0003" },
        ]}
      />,
    );

    expect(screen.getByText("Bank ****0001")).toBeInTheDocument();
    expect(screen.getByText("Bank ****0002")).toBeInTheDocument();
    // The third (oldest) row is dropped — History caps at two.
    expect(screen.queryByText("Bank ****0003")).not.toBeInTheDocument();
  });

  it("labels a terminal failure", () => {
    render(
      <WithdrawHistory
        withdrawals={[
          {
            ...withdrawal,
            status: CoinflowWithdrawalStatus.Failed,
          },
        ]}
      />,
    );

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
