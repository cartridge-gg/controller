import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CoinflowBankAccountType } from "@/hooks/payments/coinflow-withdraw";
import { CreateBankAccountDrawer } from "./CreateBankAccountDrawer";

// jsdom lacks the pointer-capture/scroll APIs Radix Select relies on.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const baseProps = {
  isOpen: true,
  onClose: () => {},
  onSubmit: () => {},
};

function fillBaseForm() {
  fireEvent.change(screen.getByLabelText("Account Number"), {
    target: { value: "123456789012" },
  });
  fireEvent.change(screen.getByLabelText("ACH/Electronic Routing Number"), {
    target: { value: "021000021" },
  });
  fireEvent.change(screen.getByLabelText("Account Nickname"), {
    target: { value: "My Checking" },
  });
}

describe("CreateBankAccountDrawer", () => {
  it("requires account number, routing number and nickname before Continue enables", () => {
    const onSubmit = vi.fn();
    render(<CreateBankAccountDrawer {...baseProps} onSubmit={onSubmit} />);

    const continueButton = screen.getByText("Continue").closest("button")!;
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Account Number"), {
      target: { value: "123456789012" },
    });
    // Routing numbers are exactly 9 digits — 8 stays invalid.
    fireEvent.change(screen.getByLabelText("ACH/Electronic Routing Number"), {
      target: { value: "02100002" },
    });
    fireEvent.change(screen.getByLabelText("Account Nickname"), {
      target: { value: "My Checking" },
    });
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("ACH/Electronic Routing Number"), {
      target: { value: "021000021" },
    });
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    expect(onSubmit).toHaveBeenCalledWith({
      alias: "My Checking",
      accountNumber: "123456789012",
      routingNumber: "021000021",
      accountType: CoinflowBankAccountType.Checking,
    });
  });

  it("submits the picked account type", () => {
    const onSubmit = vi.fn();
    render(<CreateBankAccountDrawer {...baseProps} onSubmit={onSubmit} />);

    fillBaseForm();
    fireEvent.click(screen.getByLabelText("Savings"));
    fireEvent.click(screen.getByText("Continue").closest("button")!);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ accountType: CoinflowBankAccountType.Savings }),
    );
  });

  it('reveals the address fields on an "address required" error and resubmits with them', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <CreateBankAccountDrawer {...baseProps} onSubmit={onSubmit} />,
    );

    // Hidden until the backend asks for the address.
    expect(screen.queryByLabelText("Address")).not.toBeInTheDocument();

    fillBaseForm();
    rerender(
      <CreateBankAccountDrawer
        {...baseProps}
        onSubmit={onSubmit}
        error={new Error("address required")}
      />,
    );

    // A retry path, not a hard error.
    expect(
      screen.queryByText("Unable to link your bank account"),
    ).not.toBeInTheDocument();

    const continueButton = screen.getByText("Continue").closest("button")!;
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Address"), {
      target: { value: "1 Main St" },
    });
    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Austin" },
    });
    // The state select is a Radix Select — open the trigger (keyboard, the
    // pointer path needs real PointerEvents jsdom doesn't have) and pick Texas.
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    fireEvent.click(screen.getByText("Texas"));
    fireEvent.change(screen.getByLabelText("Zip Code"), {
      target: { value: "73301" },
    });
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    expect(onSubmit).toHaveBeenCalledWith({
      alias: "My Checking",
      accountNumber: "123456789012",
      routingNumber: "021000021",
      accountType: CoinflowBankAccountType.Checking,
      address1: "1 Main St",
      city: "Austin",
      state: "TX",
      zip: "73301",
    });
  });

  it("keeps the address fields visible while the resubmit clears the error", () => {
    const { rerender } = render(
      <CreateBankAccountDrawer
        {...baseProps}
        error={new Error("address required")}
      />,
    );
    expect(screen.getByLabelText("Address")).toBeInTheDocument();

    // react-query resets the mutation error when the retry starts — the
    // fields must not disappear mid-resubmit.
    rerender(
      <CreateBankAccountDrawer {...baseProps} error={null} isSubmitting />,
    );
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
  });

  it("renders other failures as an error alert", () => {
    render(
      <CreateBankAccountDrawer
        {...baseProps}
        error={new Error("Failed to link bank account")}
      />,
    );

    expect(
      screen.getByText("Unable to link your bank account"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Address")).not.toBeInTheDocument();
  });
});
