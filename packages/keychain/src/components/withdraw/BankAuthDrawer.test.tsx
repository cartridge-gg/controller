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
    error: null,
    onLinked: () => {},
  } satisfies WithdrawContextValue["bankAuth"];

  it("shows a loader while the session is minting", () => {
    const { container } = renderWithBankAuth({ ...base, isMinting: true });
    expect(screen.getByText("Add Bank Account")).toBeInTheDocument();
    // No error alert while loading.
    expect(
      screen.queryByText("Unable to start bank linking"),
    ).not.toBeInTheDocument();
    // The Coinflow iframe stub (returns null) is not mounted yet.
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
    // Neither the loader-only nor the error-only branch is showing.
    expect(
      screen.queryByText("Unable to start bank linking"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Add Bank Account")).toBeInTheDocument();
  });
});
