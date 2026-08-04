import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationPrompt } from "./LocationPrompt";

const mocks = vi.hoisted(() => ({
  cancelWithoutClosing: vi.fn(),
  getCurrentPosition: vi.fn(),
  handleCompletion: vi.fn(),
  setShowClose: vi.fn(),
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    locationGate: { allowed: ["US-CA", "US-TX"], blocked: ["US-TX"] },
  }),
}));

vi.mock("@/hooks/route", () => ({
  useRouteCallbacks: () => ({
    cancelWithoutClosing: mocks.cancelWithoutClosing,
  }),
  useRouteCompletion: () => mocks.handleCompletion,
  useRouteParams: () => ({
    params: { id: "location-1" },
    resolve: vi.fn(),
  }),
}));

vi.mock("@/context", () => ({
  useNavigation: () => ({ setShowClose: mocks.setShowClose }),
}));

vi.mock("@/components/ErrorAlert", () => ({
  ErrorAlert: ({ description }: { description: React.ReactNode }) => (
    <div>{description}</div>
  ),
}));

vi.mock("@cartridge/controller-ui", () => ({
  Button: (
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      isLoading?: boolean;
    },
  ) => {
    const { children, isLoading, ...buttonProps } = props;
    void isLoading;
    return <button {...buttonProps}>{children}</button>;
  },
  GlobeIcon: () => <span />,
  HeaderInner: ({ title }: { title: string }) => <h1>{title}</h1>,
  LayoutContent: ({ children }: React.PropsWithChildren) => (
    <main>{children}</main>
  ),
  LayoutFooter: ({ children }: React.PropsWithChildren) => (
    <footer>{children}</footer>
  ),
}));

vi.mock("./USMap", () => ({
  USMap: ({ supportedStates }: { supportedStates: string[] }) => (
    <div
      data-testid="us-map"
      data-supported-states={supportedStates.join(",")}
    />
  ),
}));

describe("LocationPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: mocks.getCurrentPosition },
    });
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 Firefox/128.0",
    });
  });

  it("shows the supported-states map on the verification screen", () => {
    render(<LocationPrompt />);

    expect(screen.getByText("Location Verification")).toBeInTheDocument();
    expect(screen.getByTestId("us-map")).toHaveAttribute(
      "data-supported-states",
      "US-CA",
    );
  });

  it("links to browser help when location permission is denied", async () => {
    render(<LocationPrompt />);

    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
    const onError = mocks.getCurrentPosition.mock.calls[0][1];
    act(() => onError({ code: 1, message: "Permission denied" }));

    expect(
      await screen.findByRole("link", {
        name: "Learn how to enable location in Firefox.",
      }),
    ).toHaveAttribute(
      "href",
      "https://support.mozilla.org/en-US/kb/does-firefox-share-my-location-websites",
    );
  });
});
