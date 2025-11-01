import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { StandaloneConnect } from "./StandaloneConnect";
import { renderWithProviders } from "@/test/mocks/providers";

// Mock safeRedirect
const mockSafeRedirect = vi.fn();
vi.mock("@/utils/url-validator", () => ({
  safeRedirect: (...args: unknown[]) => mockSafeRedirect(...args),
}));

// Mock controller
const mockController = {
  username: vi.fn().mockReturnValue("testuser"),
  address: vi.fn().mockReturnValue("0x123456789abcdef"),
};

// Mock useConnection hook
const mockUseConnection = vi.fn();
vi.mock("@/hooks/connection", () => ({
  useConnection: () => mockUseConnection(),
}));

describe("StandaloneConnect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConnection.mockReturnValue({
      controller: mockController,
      theme: {
        name: "TestApp",
        verified: true,
        icon: "icon-url",
        cover: "cover-url",
      },
    });
  });

  describe("Verified session", () => {
    it("renders connect screen with app name", () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      expect(screen.getByText("Connect to TestApp")).toBeInTheDocument();
      expect(
        screen.getByText(
          "You're already authenticated. Click connect to continue.",
        ),
      ).toBeInTheDocument();
    });

    it("displays connected account information", () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      expect(screen.getByText("Connected Account")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    it("shows connect button", () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    it("does not show unverified warning", () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      expect(
        screen.queryByText(/This application is not verified/),
      ).not.toBeInTheDocument();
    });

    it("redirects when connect button is clicked", async () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      const connectButton = screen.getByText("Connect");
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(mockSafeRedirect).toHaveBeenCalledWith(
          "https://example.com/callback",
        );
      });
    });

    it("disables button during redirect", async () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      const connectButton = screen.getByText("Connect");
      fireEvent.click(connectButton);

      expect(connectButton).toBeDisabled();
    });
  });

  describe("Unverified session", () => {
    it("displays warning for unverified applications", () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={false}
        />,
      );

      expect(
        screen.getByText(
          /This application is not verified. Make sure you trust the site before connecting./,
        ),
      ).toBeInTheDocument();
    });

    it("still shows connect button for unverified apps", () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={false}
        />,
      );

      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    it("allows connecting to unverified apps", async () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={false}
        />,
      );

      const connectButton = screen.getByText("Connect");
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(mockSafeRedirect).toHaveBeenCalledWith(
          "https://example.com/callback",
        );
      });
    });
  });

  describe("Edge cases", () => {
    it("returns null when controller is not available", () => {
      mockUseConnection.mockReturnValue({
        controller: null,
        theme: {
          name: "TestApp",
          verified: true,
        },
      });

      const { container } = renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it("handles missing theme name gracefully", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        theme: {
          name: "",
          verified: true,
        },
      });

      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      expect(screen.getByText("Connect to Application")).toBeInTheDocument();
    });

    it("does not call redirect without redirect URL", async () => {
      renderWithProviders(
        <StandaloneConnect redirectUrl="" isVerified={true} />,
      );

      const connectButton = screen.getByText("Connect");
      fireEvent.click(connectButton);

      // Wait a bit to ensure no redirect happens
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSafeRedirect).not.toHaveBeenCalled();
    });

    it("handles multiple rapid clicks gracefully", async () => {
      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={true}
        />,
      );

      const connectButton = screen.getByText("Connect");

      // Click multiple times rapidly
      fireEvent.click(connectButton);
      fireEvent.click(connectButton);
      fireEvent.click(connectButton);

      await waitFor(() => {
        // Should only redirect once due to button being disabled
        expect(mockSafeRedirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Theme variations", () => {
    it("displays unverified theme correctly", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        theme: {
          name: "UnverifiedApp",
          verified: false,
        },
      });

      renderWithProviders(
        <StandaloneConnect
          redirectUrl="https://example.com/callback"
          isVerified={false}
        />,
      );

      expect(screen.getByText("Connect to UnverifiedApp")).toBeInTheDocument();
      expect(
        screen.getByText(/This application is not verified/),
      ).toBeInTheDocument();
    });
  });
});
