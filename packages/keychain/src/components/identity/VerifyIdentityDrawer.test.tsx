import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VerifyIdentityDrawer } from "./VerifyIdentityDrawer";

const mocks = vi.hoisted(() => ({
  verifyAsync: vi.fn(),
}));

vi.mock("@/utils/api", () => ({
  AccountVerifyReasonCode: {
    NotVerified: "NOT_VERIFIED",
    ProviderUnavailable: "PROVIDER_UNAVAILABLE",
    Verified: "VERIFIED",
  },
  useAccountVerifyMutation: () => ({
    mutateAsync: mocks.verifyAsync,
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("@cartridge/controller-ui", () => ({
  Button: (
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      isLoading?: boolean;
    },
  ) => {
    const { isLoading, ...buttonProps } = props;
    void isLoading;
    return <button {...buttonProps} />;
  },
  DateSelect: () => null,
  Drawer: ({
    isOpen,
    children,
  }: React.PropsWithChildren<{ isOpen: boolean }>) =>
    isOpen ? <div>{children}</div> : null,
  DrawerContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  UserIcon: () => null,
  isValidCalendarDate: () => true,
}));

vi.mock("./error", () => ({
  VerifyErrorAlert: ({ error }: { error: string }) => <div>{error}</div>,
}));

describe("VerifyIdentityDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyAsync.mockResolvedValue({
      accountVerify: {
        verified: true,
        reasonCode: "VERIFIED",
        retryable: false,
        correlationId: "verify-success",
      },
    });
  });

  it("does not report cancellation after successful Prove verification", async () => {
    let finishRefresh: (() => void) | undefined;
    const refresh = new Promise<void>((resolve) => {
      finishRefresh = resolve;
    });
    const onVerified = vi.fn(() => refresh);
    const onClose = vi.fn();

    render(
      <VerifyIdentityDrawer isOpen onClose={onClose} onVerified={onVerified} />,
    );

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Lovelace" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(onVerified).toHaveBeenCalledWith(true));
    expect(onClose).not.toHaveBeenCalled();

    finishRefresh?.();
    await refresh;
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps entered details and shows an actionable mismatch message", async () => {
    mocks.verifyAsync.mockResolvedValue({
      accountVerify: {
        verified: false,
        reasonCode: "NOT_VERIFIED",
        retryable: false,
        correlationId: "verify-mismatch",
      },
    });

    render(
      <VerifyIdentityDrawer isOpen onClose={vi.fn()} onVerified={vi.fn()} />,
    );

    const firstName = screen.getByLabelText("First Name");
    const lastName = screen.getByLabelText("Last Name");
    fireEvent.change(firstName, { target: { value: "Ada" } });
    fireEvent.change(lastName, { target: { value: "Lovelace" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByText(/couldn't verify these details/i);
    expect(firstName).toHaveValue("Ada");
    expect(lastName).toHaveValue("Lovelace");
    expect(screen.getByText(/verify-mismatch/)).toBeInTheDocument();
  });

  it("shows provider outages as retryable with a support reference", async () => {
    mocks.verifyAsync.mockResolvedValue({
      accountVerify: {
        verified: false,
        reasonCode: "PROVIDER_UNAVAILABLE",
        retryable: true,
        correlationId: "verify-provider",
      },
    });

    render(
      <VerifyIdentityDrawer isOpen onClose={vi.fn()} onVerified={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Lovelace" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByText(/temporarily unavailable/i);
    expect(screen.getByText(/verify-provider/)).toBeInTheDocument();
  });
});
