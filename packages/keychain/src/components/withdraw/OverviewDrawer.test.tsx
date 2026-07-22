import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OverviewDrawer } from "./OverviewDrawer";

const baseProps = {
  isOpen: true,
  onClose: () => {},
  onWithdraw: () => {},
  onContinue: () => {},
};

describe("OverviewDrawer", () => {
  it("renders the error alert and a Close button when the status query fails", () => {
    const onClose = vi.fn();
    render(
      <OverviewDrawer
        {...baseProps}
        onClose={onClose}
        error={
          new Error(
            "coinflow API error (status 401): Error Processing your request",
          )
        }
      />,
    );

    expect(
      screen.getByText("Unable to load withdrawal status"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Withdraw")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders the Withdraw button in a loading state while the status loads", () => {
    render(<OverviewDrawer {...baseProps} isLoading />);

    // The CTA is disabled with Button's loading spinner (the only other
    // button is the sheet's enabled close X).
    const loadingButton = screen
      .getAllByRole("button")
      .find((button) => (button as HTMLButtonElement).disabled);
    expect(loadingButton).toBeDefined();
    expect(loadingButton!.querySelector("svg")).toBeInTheDocument();
    expect(
      screen.queryByText("Unable to load withdrawal status"),
    ).not.toBeInTheDocument();
  });

  it("renders the flow once bounds load", () => {
    const onWithdraw = vi.fn();
    render(
      <OverviewDrawer
        {...baseProps}
        onWithdraw={onWithdraw}
        minCredits={600}
        maxCredits={250000}
        withdrawableCredits={613}
      />,
    );

    expect(screen.getByText("$6.00 minimum withdrawal")).toBeInTheDocument();
    expect(screen.getByText("Withdrawable Cash")).toBeInTheDocument();
    expect(screen.getByText("$6.13")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Withdraw"));
    expect(onWithdraw).toHaveBeenCalled();
  });

  it("reveals the amount selection in place and continues with the amount in credits", () => {
    const onContinue = vi.fn();
    render(
      <OverviewDrawer
        {...baseProps}
        onContinue={onContinue}
        minCredits={600}
        maxCredits={250000}
        withdrawableCredits={613}
        amountMode
        defaultAmountValue="6.13"
      />,
    );

    // Same drawer keeps the overview rows; the CTA becomes Continue.
    expect(screen.getByText("Withdrawable Cash")).toBeInTheDocument();
    expect(screen.getByText("Withdraw Amount")).toBeInTheDocument();
    expect(screen.queryByText("Withdraw")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Continue"));
    expect(onContinue).toHaveBeenCalledWith(613);
  });

  it("disables Continue while the amount is empty or out of bounds", () => {
    // The effective max is the balance (613), not the policy cap (250000).
    render(
      <OverviewDrawer
        {...baseProps}
        minCredits={600}
        maxCredits={250000}
        withdrawableCredits={613}
        amountMode
        defaultAmountValue="10.00"
      />,
    );

    expect(screen.getByText("$6.13 maximum withdrawal")).toBeInTheDocument();
    expect(screen.getByText("Continue").closest("button")).toBeDisabled();
  });

  it("disables Withdraw with an explainer when the balance is below the minimum", () => {
    render(
      <OverviewDrawer
        {...baseProps}
        minCredits={600}
        maxCredits={250000}
        withdrawableCredits={13}
      />,
    );

    expect(
      screen.getByText(/You need at least \$6\.00 in/),
    ).toBeInTheDocument();
    expect(screen.getByText("Withdraw").closest("button")).toBeDisabled();
  });
});
