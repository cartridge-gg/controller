import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BankAuthDrawer } from "./BankAuthDrawer";
import { WithdrawContext, type WithdrawContextValue } from "./provider";

// The real SDK is aliased to a no-op in tests (vitest.config.ts), so mounting
// the iframe is safe. useControllerTheme just supplies the iframe theme.
vi.mock("@/hooks/connection", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/connection")>()),
  useControllerTheme: () => ({ colors: { primary: "#fbcb4a" } }),
}));

const renderWithBankAuth = (bankAuth: WithdrawContextValue["bankAuth"]) => {
  const value = {
    bankAuth,
  } as unknown as WithdrawContextValue;
  return render(
    <WithdrawContext.Provider value={value}>
      <BankAuthDrawer isOpen onClose={() => {}} />
    </WithdrawContext.Provider>,
  );
};

describe("BankAuthDrawer", () => {
  const base = {
    session: undefined,
    isMinting: false,
    isLinking: false,
    error: null,
    onLinked: () => {},
  } satisfies WithdrawContextValue["bankAuth"];

  it("shows the preparing message while the session is minting", () => {
    const { container } = renderWithBankAuth({ ...base, isMinting: true });
    expect(screen.getByText("Add Bank Account")).toBeInTheDocument();
    expect(
      screen.getByText("Preparing bank authorization..."),
    ).toBeInTheDocument();
    // No error alert while loading.
    expect(
      screen.queryByText("Unable to start bank linking"),
    ).not.toBeInTheDocument();
    // The Coinflow iframe stub (returns null) is not mounted yet.
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("shows the adding message while the linked destination settles", () => {
    // A session is present, but isLinking keeps the processing message up
    // (rather than the iframe) until the refetched status lists the new
    // destination.
    const { container } = renderWithBankAuth({
      ...base,
      isLinking: true,
      session: {
        sessionKey: "sk_test",
        merchantId: "cartridge",
        env: "sandbox",
      },
    });
    expect(screen.getByText("Add Bank Account")).toBeInTheDocument();
    expect(screen.getByText("Adding your bank account...")).toBeInTheDocument();
    expect(
      screen.queryByText("Preparing bank authorization..."),
    ).not.toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("surfaces a session-minting failure as an error alert", () => {
    renderWithBankAuth({
      ...base,
      error: new Error("session mint failed"),
    });
    expect(
      screen.getByText("Unable to start bank linking"),
    ).toBeInTheDocument();
  });

  it("renders the hosted UI once a session is available", () => {
    renderWithBankAuth({
      ...base,
      session: {
        sessionKey: "sk_test",
        merchantId: "cartridge",
        env: "sandbox",
      },
    });
    // The iframe branch is active, so the non-iframe DrawerContent chrome
    // (title) and both the error and processing messages are all gone.
    expect(screen.queryByText("Add Bank Account")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Unable to start bank linking"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Preparing bank authorization..."),
    ).not.toBeInTheDocument();
  });
});
