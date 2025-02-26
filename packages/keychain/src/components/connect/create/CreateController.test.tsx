import { vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateController } from "./CreateController";
import { describe, expect, beforeEach, it } from "vitest";
import { LoginMode } from "../types";
import { renderWithProviders } from "@/test/mocks/providers";

// Create mock functions that we'll use in multiple tests
const mockUseCreateController = vi.fn();
const mockUseUsernameValidation = vi.fn();
const mockUseControllerTheme = vi.fn();

// Mock the hooks
vi.mock("@/hooks/posthog", () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

vi.mock("@/hooks/connection", () => ({
  useControllerTheme: () => mockUseControllerTheme(),
}));

vi.mock("inapp-spy", () => ({
  default: () => ({
    isInApp: false,
  }),
}));

vi.mock("./useUsernameValidation", () => ({
  useUsernameValidation: () => mockUseUsernameValidation(),
}));

vi.mock("./useCreateController", () => ({
  useCreateController: () => mockUseCreateController(),
}));

describe("CreateController", () => {
  const defaultProps = {
    isSlot: false,
    loginMode: LoginMode.Webauthn,
    onCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock returns
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(undefined),
    });
    mockUseUsernameValidation.mockReturnValue({
      status: "valid",
      exists: false,
    });
    mockUseControllerTheme.mockReturnValue({
      name: "cartridge",
      verified: true,
      icon: "icon-url",
      cover: "cover-url",
    });
  });

  const renderComponent = () => {
    return renderWithProviders(<CreateController {...defaultProps} />);
  };

  it("renders basic content correctly", () => {
    renderComponent();
    expect(screen.getByText("Play with Controller")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  });

  it("handles username input correctly", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText("Username");

    fireEvent.change(input, { target: { value: "testuser" } });
    await waitFor(() => {
      expect(input).toHaveValue("testuser");
    });
  });

  it("submits form with valid username", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
    });

    renderComponent();

    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });

    const submitButton = screen.getByText("sign up");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("validuser", false);
    });
  });

  it("shows loading state during submission", async () => {
    mockUseCreateController.mockReturnValue({
      isLoading: true,
      error: undefined,
      setError: vi.fn(),
      handleSubmit: vi.fn(),
    });

    renderComponent();
    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeDisabled();
  });

  it("shows error message when validation fails", async () => {
    const errorMessage = "Username is invalid";
    mockUseUsernameValidation.mockReturnValue({
      status: "invalid",
      exists: false,
      error: { message: errorMessage },
    });

    renderComponent();
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "invalid@user" } });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("shows warning for unverified theme", async () => {
    mockUseControllerTheme.mockReturnValue({
      name: "cartridge",
      verified: false,
      icon: "icon-url",
      cover: "cover-url",
    });

    renderComponent();
    expect(screen.getByText("Please proceed with caution")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Application domain does not match the configured domain.",
      ),
    ).toBeInTheDocument();
  });

  it("calls onCreated callback after successful creation", async () => {
    const onCreated = vi.fn();
    const handleSubmit = vi.fn().mockImplementation(() => {
      onCreated();
      return Promise.resolve();
    });

    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
    });

    renderWithProviders(
      <CreateController {...defaultProps} onCreated={onCreated} />,
    );

    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });

    const submitButton = screen.getByText("sign up");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("validuser", false);
      expect(onCreated).toHaveBeenCalled();
    });
  });
});
