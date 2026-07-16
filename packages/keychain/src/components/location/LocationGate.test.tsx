import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationGate } from "./LocationGate";

const mocks = vi.hoisted(() => ({
  closeModal: vi.fn(),
  getCurrentPosition: vi.fn(),
  getIpLocation: vi.fn(),
  reverseGeocodeLocation: vi.fn(),
  setLocationGateVerified: vi.fn(),
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    closeModal: mocks.closeModal,
    setLocationGateVerified: mocks.setLocationGateVerified,
    theme: { name: "Test Game" },
  }),
}));

vi.mock("@/components/ErrorAlert", () => ({
  ErrorAlert: ({ description }: { description: string }) => (
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

vi.mock("@/utils/ip", () => ({
  getIpLocation: mocks.getIpLocation,
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
  USMap: () => <div data-testid="us-map" />,
}));

const route = `/location-gate?${new URLSearchParams({
  returnTo: "/connect?id=connect-1",
  gate: JSON.stringify({ blocked: ["US-NY"] }),
})}`;

function renderGate() {
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
  });

  it("requests browser geolocation after the user continues", () => {
    renderGate();

    expect(screen.getByText("Location Verification")).toBeInTheDocument();
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

  it("uses the GPS result as the primary geofence signal", async () => {
    mocks.reverseGeocodeLocation.mockResolvedValue({
      countryCode: "US",
      regionCode: "US-CA",
    });
    renderGate();
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

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
    expect(mocks.getIpLocation).not.toHaveBeenCalled();
  });

  it("falls back to IP geolocation when browser geolocation fails", async () => {
    mocks.getIpLocation.mockResolvedValue({
      countryCode: "US",
      regionCode: "US-NY",
    });
    renderGate();
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

    const onError = mocks.getCurrentPosition.mock.calls[0][1];
    onError({ code: 1, message: "Permission denied" });

    expect(await screen.findByText("Region Restricted")).toBeInTheDocument();
    expect(mocks.getIpLocation).toHaveBeenCalledOnce();
    expect(mocks.setLocationGateVerified).not.toHaveBeenCalled();
  });

  it("falls back to IP geolocation when browser geolocation is unavailable", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    });
    mocks.getIpLocation.mockResolvedValue({
      countryCode: "US",
      regionCode: "US-CA",
    });
    renderGate();

    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

    await waitFor(() => {
      expect(mocks.setLocationGateVerified).toHaveBeenCalledWith(true);
    });
    expect(mocks.getCurrentPosition).not.toHaveBeenCalled();
    expect(mocks.getIpLocation).toHaveBeenCalledOnce();
  });

  it("cancels the location gate without requesting location", () => {
    renderGate();

    fireEvent.click(screen.getByRole("button", { name: "CANCEL" }));

    expect(mocks.closeModal).toHaveBeenCalledOnce();
    expect(mocks.getCurrentPosition).not.toHaveBeenCalled();
    expect(mocks.getIpLocation).not.toHaveBeenCalled();
  });

  it("fails closed when neither GPS nor IP can resolve a location", async () => {
    mocks.reverseGeocodeLocation.mockRejectedValue(
      new Error("Reverse geocoding failed"),
    );
    mocks.getIpLocation.mockResolvedValue({
      countryCode: null,
      regionCode: null,
    });
    renderGate();
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

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
