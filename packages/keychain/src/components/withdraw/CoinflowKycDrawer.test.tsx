import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CoinflowKycStatus } from "@/hooks/payments/coinflow-withdraw";
import { CoinflowKycDrawer } from "./CoinflowKycDrawer";

// jsdom lacks the pointer-capture/scroll APIs Radix Select relies on.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const userData = {
  firstName: "Jane",
  lastName: "Doe",
  dob: "1990-04-12",
  email: "jane@example.com",
  phoneNumber: "+15555550123",
};

const baseProps = {
  isOpen: true,
  onClose: () => {},
  onSubmit: () => {},
  kycStatus: CoinflowKycStatus.None,
  userData,
};

describe("CoinflowKycDrawer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefills the identity summary read-only from the verified user data", () => {
    render(<CoinflowKycDrawer {...baseProps} />);

    const input = screen.getByLabelText("Full name") as HTMLInputElement;
    expect(input.value).toBe(`${userData.firstName} ${userData.lastName}`);
    expect(input).toBeDisabled();
  });

  it("requires every field before Continue enables, then submits them", () => {
    const onSubmit = vi.fn();
    render(<CoinflowKycDrawer {...baseProps} onSubmit={onSubmit} />);

    const continueButton = screen.getByText("Continue").closest("button")!;
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Address"), {
      target: { value: "1 Main St" },
    });
    fireEvent.change(screen.getByPlaceholderText("City"), {
      target: { value: "Austin" },
    });
    // The state select is a Radix Select — open the trigger (keyboard, the
    // pointer path needs real PointerEvents jsdom doesn't have) and pick Texas.
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    fireEvent.click(screen.getByText("Texas"));
    fireEvent.change(screen.getByPlaceholderText("Zip code"), {
      target: { value: "73301" },
    });
    // Still disabled: the last 4 digits of the SSN are required too.
    expect(continueButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Last 4 Digits of SSN"), {
      target: { value: "1234" },
    });
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    expect(onSubmit).toHaveBeenCalledWith({
      address1: "1 Main St",
      city: "Austin",
      state: "TX",
      zip: "73301",
      ssnLast4: "1234",
    });
  });

  it("renders the submit error from createCoinflowKYC", () => {
    render(
      <CoinflowKycDrawer
        {...baseProps}
        error={new Error("Complete your identity verification")}
      />,
    );

    expect(
      screen.getByText("Unable to verify your identity"),
    ).toBeInTheDocument();
  });

  it("shows the hosted-link button while PENDING with a verificationLink", () => {
    const open = vi.fn();
    vi.stubGlobal("open", open);
    render(
      <CoinflowKycDrawer
        {...baseProps}
        kycStatus={CoinflowKycStatus.Pending}
        verificationLink="https://sandbox.coinflow.cash/verify/abc123"
      />,
    );

    // The form is replaced by the waiting state.
    expect(screen.queryByPlaceholderText("Address")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Complete Verification"));
    expect(open).toHaveBeenCalledWith(
      "https://sandbox.coinflow.cash/verify/abc123",
      "_blank",
      "noopener",
    );
  });

  it("shows the waiting state with a Close button while PENDING without a link", () => {
    const onClose = vi.fn();
    render(
      <CoinflowKycDrawer
        {...baseProps}
        onClose={onClose}
        kycStatus={CoinflowKycStatus.Pending}
      />,
    );

    expect(screen.getByText(/verification is in progress/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the form with contextual copy for REJECTED and EXPIRED", () => {
    const { rerender } = render(
      <CoinflowKycDrawer
        {...baseProps}
        kycStatus={CoinflowKycStatus.Rejected}
      />,
    );
    expect(screen.getByText(/was unsuccessful/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();

    rerender(
      <CoinflowKycDrawer
        {...baseProps}
        kycStatus={CoinflowKycStatus.Expired}
      />,
    );
    expect(screen.getByText(/has expired/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
  });
});
