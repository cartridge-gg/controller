import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteAccountSheet } from "../delete-account-sheet";

// Mock @cartridge/controller-ui components
vi.mock("@cartridge/controller-ui", () => ({
  AlertIcon: ({ ...props }: Record<string, unknown>) => (
    <span data-testid="alert-icon" {...props} />
  ),
  Button: ({
    children,
    disabled,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Input: ({
    value,
    onChange,
    disabled,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <input value={value} onChange={onChange} disabled={disabled} {...props} />
  ),
  Sheet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SheetClose: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SheetContent: ({
    children,
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div>{children}</div>,
  SheetFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SpinnerIcon: ({ ...props }: Record<string, unknown>) => (
    <span data-testid="spinner-icon" {...props} />
  ),
  TrashIcon: ({ ...props }: Record<string, unknown>) => (
    <span data-testid="trash-icon" {...props} />
  ),
}));

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  username: "testuser",
  onConfirm: vi.fn().mockResolvedValue(undefined),
};

describe("DeleteAccountSheet", () => {
  it("delete button is disabled when input is empty", () => {
    render(<DeleteAccountSheet {...defaultProps} />);
    const deleteButton = screen.getByTestId("delete-confirm-button");
    expect(deleteButton).toBeDisabled();
  });

  it("delete button is disabled when input doesn't match username", () => {
    render(<DeleteAccountSheet {...defaultProps} />);
    const input = screen.getByTestId("delete-confirm-input");
    fireEvent.change(input, { target: { value: "wronguser" } });
    const deleteButton = screen.getByTestId("delete-confirm-button");
    expect(deleteButton).toBeDisabled();
  });

  it("delete button is enabled when input matches username exactly", () => {
    render(<DeleteAccountSheet {...defaultProps} />);
    const input = screen.getByTestId("delete-confirm-input");
    fireEvent.change(input, { target: { value: "testuser" } });
    const deleteButton = screen.getByTestId("delete-confirm-button");
    expect(deleteButton).not.toBeDisabled();
  });

  it("both buttons are disabled during loading state", async () => {
    const neverResolve = vi.fn(() => new Promise<void>(() => {}));
    render(<DeleteAccountSheet {...defaultProps} onConfirm={neverResolve} />);

    const input = screen.getByTestId("delete-confirm-input");
    fireEvent.change(input, { target: { value: "testuser" } });

    const deleteButton = screen.getByTestId("delete-confirm-button");
    fireEvent.click(deleteButton);

    // After clicking, both buttons should be disabled during loading
    const buttons = screen.getAllByRole("button");
    // The cancel and delete buttons should both be disabled
    const cancelButton = buttons.find((btn) => btn.textContent === "Cancel");
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});
