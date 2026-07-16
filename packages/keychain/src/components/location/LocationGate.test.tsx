import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocationGateOptions } from "@cartridge/controller";
import { connect } from "@/utils/connection/connect";
import { LocationGate } from "./LocationGate";

const mocks = vi.hoisted(() => ({
  closeModal: vi.fn(),
  getCurrentPosition: vi.fn(),
  queryPermission: vi.fn(),
  reverseGeocodeLocation: vi.fn(),
  setLocationGateVerified: vi.fn(),
  setShowClose: vi.fn(),
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    closeModal: mocks.closeModal,
    setLocationGateVerified: mocks.setLocationGateVerified,
    theme: { name: "Test Game" },
  }),
}));

vi.mock("@/context", () => ({
  useNavigation: () => ({
    setShowClose: mocks.setShowClose,
  }),
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

vi.mock("@/utils/location-gate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/location-gate")>();
  return {
    ...actual,
    reverseGeocodeLocation: mocks.reverseGeocodeLocation,
  };
});

vi.mock("@cartridge/presets", () => ({
  defaultTheme: { name: "Cartridge" },
  loadConfig: vi.fn(),
}));

vi.mock("./USMap", () => ({
  USMap: ({ supportedStates }: { supportedStates: string[] }) => (
    <div
      data-testid="us-map"
      data-supported-states={supportedStates.join(",")}
    />
  ),
}));

function renderGate(gate: LocationGateOptions = { blocked: ["US-NY"] }) {
  const route = `/location-gate?${new URLSearchParams({
    returnTo: "/connect?id=connect-1",
    gate: JSON.stringify(gate),
  })}`;
  return render(
    <MemoryRouter initialEntries={[route]}>
      <LocationGate />
    </MemoryRouter>,
  );
}

describe("LocationGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: mocks.getCurrentPosition },
    });
    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      value: { query: mocks.queryPermission },
    });
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
    });
    mocks.queryPermission.mockResolvedValue({ state: "prompt" });
  });

  it("shows a map of the supported states on the verification screen", async () => {
    renderGate({ allowed: ["US-CA", "US-TX"], blocked: ["US-TX"] });

    expect(await screen.findByTestId("us-map")).toHaveAttribute(
      "data-supported-states",
      "US-CA",
    );
  });

  it("requests browser geolocation after the user continues", async () => {
    renderGate();

    expect(
      await screen.findByText("Location Verification"),
    ).toBeInTheDocument();
    expect(mocks.getCurrentPosition).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

    expect(mocks.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 15000,
      },
    );
  });

  it("uses a close button instead of the back button", async () => {
    renderGate();

    await screen.findByText("Location Verification");

    expect(mocks.setShowClose).toHaveBeenCalledWith(true);
  });

  it("uses the GPS result as the primary geofence signal", async () => {
    mocks.reverseGeocodeLocation.mockResolvedValue({
      countryCode: "US",
      regionCode: "US-CA",
    });
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: "CONTINUE" }));

    const onSuccess = mocks.getCurrentPosition.mock.calls[0][0];
    onSuccess({
      coords: { latitude: 34.05, longitude: -118.24 },
      timestamp: 1,
    });

    await waitFor(() => {
      expect(mocks.setLocationGateVerified).toHaveBeenCalledWith(true);
    });
    expect(mocks.reverseGeocodeLocation).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 34.05, longitude: -118.24 }),
    );
  });

  it("does not pass when browser geolocation permission is denied", async () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 Firefox/128.0",
    });
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: "CONTINUE" }));

    const onError = mocks.getCurrentPosition.mock.calls[0][1];
    onError({ code: 1, message: "Permission denied" });

    expect(
      await screen.findByText("Location permission was denied."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Learn how to enable location in Firefox.",
      }),
    ).toHaveAttribute(
      "href",
      "https://support.mozilla.org/en-US/kb/does-firefox-share-my-location-websites",
    );
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link")).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(mocks.setLocationGateVerified).not.toHaveBeenCalled();
  });

  it("does not pass when browser geolocation is unavailable", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    });
    renderGate();

    fireEvent.click(await screen.findByRole("button", { name: "CONTINUE" }));

    expect(
      await screen.findByText(
        "Location services are not available in this browser.",
      ),
    ).toBeInTheDocument();
    expect(mocks.getCurrentPosition).not.toHaveBeenCalled();
    expect(mocks.setLocationGateVerified).not.toHaveBeenCalled();
  });

  it("silently checks location when browser permission is already granted", async () => {
    mocks.queryPermission.mockResolvedValue({ state: "granted" });
    mocks.reverseGeocodeLocation.mockResolvedValue({
      countryCode: "US",
      regionCode: "US-CA",
    });

    renderGate();

    await waitFor(() => {
      expect(mocks.getCurrentPosition).toHaveBeenCalledOnce();
    });
    expect(screen.queryByText("Location Verification")).not.toBeInTheDocument();

    const onSuccess = mocks.getCurrentPosition.mock.calls[0][0];
    onSuccess({
      coords: { latitude: 34.05, longitude: -118.24 },
      timestamp: 1,
    });

    await waitFor(() => {
      expect(mocks.setLocationGateVerified).toHaveBeenCalledWith(true);
    });
  });

  it("shows consent without checking when browser permission is denied", async () => {
    mocks.queryPermission.mockResolvedValue({ state: "denied" });

    renderGate();

    expect(
      await screen.findByText("Location Verification"),
    ).toBeInTheDocument();
    expect(mocks.getCurrentPosition).not.toHaveBeenCalled();
    expect(mocks.setLocationGateVerified).not.toHaveBeenCalled();
  });

  it("shows consent when the browser permission status cannot be queried", async () => {
    mocks.queryPermission.mockRejectedValue(new Error("Unsupported"));

    renderGate();

    expect(
      await screen.findByText("Location Verification"),
    ).toBeInTheDocument();
    expect(mocks.getCurrentPosition).not.toHaveBeenCalled();
  });

  it("cancels the location gate without requesting location", async () => {
    renderGate();

    fireEvent.click(await screen.findByRole("button", { name: "CANCEL" }));

    expect(mocks.closeModal).toHaveBeenCalledOnce();
    expect(mocks.getCurrentPosition).not.toHaveBeenCalled();
  });

  it("fails closed when GPS cannot resolve a location", async () => {
    mocks.reverseGeocodeLocation.mockRejectedValue(
      new Error("Reverse geocoding failed"),
    );
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: "CONTINUE" }));

    const onSuccess = mocks.getCurrentPosition.mock.calls[0][0];
    onSuccess({
      coords: { latitude: 0, longitude: 0 },
      timestamp: 1,
    });

    expect(
      await screen.findByText("Unable to verify location."),
    ).toBeInTheDocument();
    expect(mocks.setLocationGateVerified).not.toHaveBeenCalled();
  });
});

describe("location gate routing", () => {
  it("starts authentication before a configured location gate", () => {
    const navigate = vi.fn();
    const connectFn = connect({
      navigate,
      setRpcUrl: vi.fn(),
      getLocationGate: () => ({ blocked: ["US-NY"] }),
    })();

    void connectFn({ signupOptions: ["password"] });

    expect(navigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/connect\?/),
      { replace: true },
    );
  });
});
