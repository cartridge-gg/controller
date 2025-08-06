import { vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateController } from "./CreateController";
import { describe, expect, beforeEach, it } from "vitest";
import { LoginMode } from "../types";
import { renderWithProviders } from "@/test/mocks/providers";
import { AuthenticationStep } from "./utils";

// Create mock functions that we'll use in multiple tests
const mockUseCreateController = vi.fn();
const mockUseUsernameValidation = vi.fn();
const mockUseControllerTheme = vi.fn();
const mockUseWallets = vi.fn().mockReturnValue({ wallets: [] });

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

// Mock the hooks
vi.mock("@/hooks/posthog", () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));
vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    theme: mockUseControllerTheme(),
    controller: null,
    policies: null,
    context: null,
    origin: "test-origin",
    rpcUrl: "test-rpc",
    chainId: "SN_MAIN",
    project: null,
    namespace: null,
    tokens: [],
    verified: true,
    isConfigLoading: false,
    controllerVersion: null,
    setController: vi.fn(),
    setContext: vi.fn(),
    closeModal: vi.fn(),
    openModal: vi.fn(),
    logout: vi.fn(),
    openSettings: vi.fn(),
    externalDetectWallets: vi.fn(),
    externalConnectWallet: vi.fn(),
    externalSignMessage: vi.fn(),
    externalSignTypedData: vi.fn(),
    externalSendTransaction: vi.fn(),
    externalGetBalance: vi.fn(),
  }),
  useControllerTheme: () => mockUseControllerTheme(),
}));

vi.mock("@/hooks/wallets", () => ({
  useWallets: () => mockUseWallets(),
}));

// Mock InAppSpy with configurable return values
const mockInAppSpy = vi.fn();
vi.mock("inapp-spy", () => ({
  default: () => mockInAppSpy(),
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
      authenticationStep: AuthenticationStep.FillForm,
      setChangeWallet: vi.fn(),
      signupOptions: ["webauthn"],
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
    // Set default InAppSpy mock (not in app)
    mockInAppSpy.mockReturnValue({
      isInApp: false,
      appKey: undefined,
      appName: undefined,
      ua: "test-user-agent",
    });
  });
  const renderComponent = () => {
    return renderWithProviders(<CreateController {...defaultProps} />);
  };
  it("renders basic content correctly", () => {
    renderComponent();
    expect(screen.getByText("Connect Controller")).toBeInTheDocument();
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
    const setAuthenticationStep = vi.fn();
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
      authenticationStep: AuthenticationStep.FillForm,
      setAuthenticationStep,
      setChangeWallet: vi.fn(),
      signupOptions: ["webauthn"],
    });
    renderComponent();
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });
    const submitButton = screen.getByText("sign up");
    fireEvent.click(submitButton);
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
      authenticationStep: AuthenticationStep.ChooseMethod,
      setAuthenticationStep,
      signupOptions: ["webauthn"],
    });
    const passkeyButton = await screen.findByText("Passkey");
    fireEvent.click(passkeyButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("validuser", false, "webauthn");
    });
  });

  it("shows loading state during submission", async () => {
    mockUseCreateController.mockReturnValue({
      isLoading: true,
      error: undefined,
      setError: vi.fn(),
      handleSubmit: vi.fn(),
      authenticationStep: AuthenticationStep.FillForm,
      setAuthenticationStep: vi.fn(),
      setChangeWallet: vi.fn(),
      signupOptions: ["webauthn"],
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
    const changeWalletButton = screen.getByText("Please proceed with caution");
    expect(changeWalletButton).toBeInTheDocument();
    fireEvent.click(changeWalletButton);
    expect(
      screen.getByText(
        "Application domain does not match the configured domain.",
      ),
    ).toBeInTheDocument();
  });
  it("calls onCreated callback after successful creation", async () => {
    const handleSubmit = vi.fn().mockImplementation(() => {
      return Promise.resolve();
    });
    const setAuthenticationStep = vi.fn();
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
      authenticationStep: AuthenticationStep.FillForm,
      setAuthenticationStep,
      setChangeWallet: vi.fn(),
      signupOptions: ["webauthn"],
    });
    renderWithProviders(<CreateController {...defaultProps} />);
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });
    const submitButton = screen.getByText("sign up");
    fireEvent.click(submitButton);
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
      authenticationStep: AuthenticationStep.ChooseMethod,
      setAuthenticationStep,
      setChangeWallet: vi.fn(),
      signupOptions: ["webauthn"],
    });
    const passkeyButton = await screen.findByText("Passkey");
    fireEvent.click(passkeyButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("validuser", false, "webauthn");
    });
  });

  describe("In-app browser handling", () => {
    it("shows normal auth button when not in app browser", () => {
      // Default mock already sets isInApp: false
      renderComponent();

      const input = screen.getByPlaceholderText("Username");
      fireEvent.change(input, { target: { value: "testuser" } });

      expect(screen.getByText("sign up")).toBeInTheDocument();
      expect(screen.queryByText(/not supported/)).not.toBeInTheDocument();
    });

    it("shows normal auth button when in app but appKey is undefined (dojo apps)", () => {
      mockInAppSpy.mockReturnValue({
        isInApp: true,
        appKey: undefined,
        appName: "Dojo App",
        ua: "test-user-agent",
      });

      renderComponent();

      const input = screen.getByPlaceholderText("Username");
      fireEvent.change(input, { target: { value: "testuser" } });

      expect(screen.getByText("sign up")).toBeInTheDocument();
      expect(screen.queryByText(/not supported/)).not.toBeInTheDocument();
    });

    it("shows error message when in unsupported in-app browser", () => {
      mockInAppSpy.mockReturnValue({
        isInApp: true,
        appKey: "some-app-key",
        appName: "Unknown App",
        ua: "test-user-agent",
      });

      renderComponent();

      const input = screen.getByPlaceholderText("Username");
      fireEvent.change(input, { target: { value: "testuser" } });

      // Should show error message with app name
      expect(
        screen.getByText("Using Controller in Unknown App is not supported"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please open this page in your device's native browser (Safari/Chrome) to continue.",
        ),
      ).toBeInTheDocument();

      // Should still show auth button (but it may be disabled or handle redirect)
      expect(screen.getByText("sign up")).toBeInTheDocument();
    });
  });
});
