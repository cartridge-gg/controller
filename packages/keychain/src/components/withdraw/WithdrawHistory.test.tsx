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
  destinationDisplay: "Bank ****0283",
  failureCode: null,
  failureReason: null,
};

describe("WithdrawHistory", () => {
  it("renders the empty placeholder when there is no withdrawal", () => {
    render(<WithdrawHistory />);

    expect(screen.getByText("History")).toBeInTheDocument();
    expect(
      screen.getByText("You have not made any withdrawals"),
    ).toBeInTheDocument();
  });

  it("renders the active withdrawal as a card with amount + status", () => {
    render(<WithdrawHistory withdrawal={withdrawal} />);

    expect(screen.getByText("Bank ****0283")).toBeInTheDocument();
    // Gross amount, not net — matches the mock's $6.00.
    expect(screen.getByText("$6.00")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(
      screen.queryByText("You have not made any withdrawals"),
    ).not.toBeInTheDocument();
  });

  it("labels a terminal failure", () => {
    render(
      <WithdrawHistory
        withdrawal={{
          ...withdrawal,
          status: CoinflowWithdrawalStatus.Failed,
        }}
      />,
    );

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
