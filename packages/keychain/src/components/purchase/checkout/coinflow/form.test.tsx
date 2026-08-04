import type { InputHTMLAttributes } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoinflowForm, type CoinflowFormHandle } from "./form";

const mocks = vi.hoisted(() => ({
  cardCheckout: vi.fn(),
  tokenize: vi.fn(),
  identity: {
    isIdentityVerified: true,
    userData: { firstName: "Ada", lastName: "Lovelace" },
  } as {
    isIdentityVerified: boolean;
    userData: { firstName?: string; lastName?: string };
  },
}));

vi.mock("@coinflowlabs/react", async () => {
  const React = await import("react");
  return {
    MerchantStyle: { Sharp: "sharp" },
    CoinflowCardForm: React.forwardRef(
      ({ onLoad }: { onLoad?: () => void }, ref) => {
        React.useImperativeHandle(ref, () => ({
          tokenize: mocks.tokenize,
        }));
        React.useEffect(() => onLoad?.(), [onLoad]);
        return <div data-testid="coinflow-card-form" />;
      },
    ),
  };
});

vi.mock("@cartridge/controller-ui", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/components/identity/provider", () => ({
  useIdentityContext: () => mocks.identity,
}));

vi.mock("@/components/purchase/checkout/rails", () => ({
  useCoinflowRail: () => ({
    intent: { id: "payment-1", merchantId: "merchant-1" },
    env: "sandbox",
    onComplete: vi.fn(),
  }),
}));

vi.mock("@/hooks/connection", () => ({
  useControllerTheme: () => undefined,
}));

vi.mock("@/utils/api", () => ({
  useCoinflowCardCheckoutMutation: () => ({
    mutateAsync: mocks.cardCheckout,
  }),
}));

describe("CoinflowForm", () => {
  beforeEach(() => {
    mocks.cardCheckout.mockReset().mockResolvedValue({});
    mocks.tokenize.mockReset().mockResolvedValue({
      token: "card-token",
      expMonth: 12,
      expYear: 2030,
    });
    mocks.identity = {
      isIdentityVerified: true,
      userData: { firstName: "Ada", lastName: "Lovelace" },
    };
  });

  it("prefills verified Prove names and exposes billing autofill fields", async () => {
    render(<CoinflowForm />);

    expect(await screen.findByPlaceholderText("First name")).toHaveValue("Ada");
    expect(screen.getByPlaceholderText("Last name")).toHaveValue("Lovelace");
    expect(screen.getByPlaceholderText("Address")).toHaveAttribute(
      "autocomplete",
      "billing address-line1",
    );
    expect(screen.getByPlaceholderText("City")).toHaveAttribute(
      "autocomplete",
      "billing address-level2",
    );
    expect(screen.getByPlaceholderText("State")).toHaveAttribute(
      "autocomplete",
      "billing address-level1",
    );
    expect(screen.getByPlaceholderText("Postal code")).toHaveAttribute(
      "autocomplete",
      "billing postal-code",
    );
    expect(screen.queryByPlaceholderText(/Country/)).not.toBeInTheDocument();
  });

  it("submits the fixed US country and preserves a user-edited name", async () => {
    mocks.identity = { isIdentityVerified: false, userData: {} };
    let handle: CoinflowFormHandle | undefined;
    const { rerender } = render(
      <CoinflowForm onStateChange={(next) => (handle = next)} />,
    );

    fireEvent.change(await screen.findByPlaceholderText("First name"), {
      target: { value: "Grace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Address"), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByPlaceholderText("City"), {
      target: { value: "New York" },
    });

    mocks.identity = {
      isIdentityVerified: true,
      userData: { firstName: "Ada", lastName: "Lovelace" },
    };
    rerender(<CoinflowForm onStateChange={(next) => (handle = next)} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("First name")).toHaveValue("Grace");
      expect(screen.getByPlaceholderText("Last name")).toHaveValue("Lovelace");
      expect(handle?.isFormValid).toBe(true);
    });

    await act(async () => handle?.submit());

    expect(mocks.cardCheckout).toHaveBeenCalledWith({
      input: expect.objectContaining({
        firstName: "Grace",
        lastName: "Lovelace",
        country: "US",
        city: "New York",
      }),
    });
  });
});
