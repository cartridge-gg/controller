import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DepositCredits } from "./DepositCredits";

const mocks = vi.hoisted(() => ({
  initiateIdentityVerification: vi.fn(),
  depositRequest: { preferredMethod: { type: "coinflow" } },
  identity: {
    isLoadingUserData: false,
    isVerifying: false,
    isCanceled: false,
    ageGateStatus: {
      isPending: true,
      isBlocked: false,
      isAllowed: false,
    },
  },
}));

vi.mock("@/hooks/geo", () => ({
  useGeoLocation: () => ({ isUS: true, countryCodeLoaded: true }),
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({ defaultPaymentMethod: "credit-card" }),
}));

vi.mock("@/components/identity/provider", () => ({
  useIdentityContext: () => ({
    ...mocks.identity,
    initiateIdentityVerification: mocks.initiateIdentityVerification,
  }),
}));

vi.mock("./provider", () => ({
  useCreditsContext: () => ({
    depositInProgress: null,
    depositRequest: mocks.depositRequest,
  }),
}));

vi.mock("@/components/purchase/checkout/onchain/wallet-drawer", () => ({
  WalletSelectionDrawer: () => null,
}));

vi.mock("./AmountSelectionDrawer", () => ({
  AmountSelectionDrawer: ({
    isOpen,
    error,
    onContinue,
  }: {
    isOpen: boolean;
    error?: string;
    onContinue: (amount: number) => void;
  }) =>
    isOpen ? (
      <>
        {error && <p>{error}</p>}
        <button disabled={!!error} onClick={() => onContinue(25)}>
          Choose $25
        </button>
      </>
    ) : null,
}));

vi.mock("./Checkout", () => ({
  Checkout: ({ isOpen, amount }: { isOpen: boolean; amount: number }) => (
    <div data-testid="checkout">{isOpen ? `checkout:${amount}` : "closed"}</div>
  ),
}));

describe("DepositCredits age verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.identity, {
      isLoadingUserData: false,
      isVerifying: false,
      isCanceled: false,
      ageGateStatus: {
        isPending: true,
        isBlocked: false,
        isAllowed: false,
      },
    });
  });

  it("opens identity verification after amount selection and resumes checkout", async () => {
    const view = render(<DepositCredits isOpen onClose={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Choose $25" }));

    await waitFor(() =>
      expect(mocks.initiateIdentityVerification).toHaveBeenCalledTimes(1),
    );
    expect(
      screen.queryByRole("button", { name: "Choose $25" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("checkout")).toHaveTextContent("closed");

    mocks.identity.ageGateStatus = {
      isPending: false,
      isBlocked: false,
      isAllowed: true,
    };
    view.rerender(<DepositCredits isOpen onClose={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByTestId("checkout")).toHaveTextContent("checkout:25"),
    );
  });

  it("continues directly when the user already satisfies the age gate", async () => {
    mocks.identity.ageGateStatus = {
      isPending: false,
      isBlocked: false,
      isAllowed: true,
    };
    render(<DepositCredits isOpen onClose={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Choose $25" }));

    await waitFor(() =>
      expect(screen.getByTestId("checkout")).toHaveTextContent("checkout:25"),
    );
    expect(mocks.initiateIdentityVerification).not.toHaveBeenCalled();
  });

  it("explains why a verified under-age user cannot continue", async () => {
    mocks.identity.ageGateStatus = {
      isPending: false,
      isBlocked: true,
      isAllowed: false,
    };
    render(<DepositCredits isOpen onClose={vi.fn()} />);

    expect(
      await screen.findByText("You do not meet this game's age requirement."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose $25" })).toBeDisabled();
    expect(mocks.initiateIdentityVerification).not.toHaveBeenCalled();
  });
});
