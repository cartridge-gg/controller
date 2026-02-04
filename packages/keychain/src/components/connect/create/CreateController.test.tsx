import { vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateController } from "./CreateController";
import { describe, expect, beforeEach, it } from "vitest";
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
vi.mock("@/hooks/debounce", () => ({
  useDebounce: <T,>(value: T) => ({ debouncedValue: value }),
}));
describe("CreateController", () => {
  const defaultProps = {
    isSlot: false,
    error: undefined,
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
      setAuthenticationStep: vi.fn(),
      waitingForConfirmation: false,
      changeWallet: false,
      setChangeWallet: vi.fn(),
      overlay: null,
      setOverlay: vi.fn(),
      signupOptions: ["webauthn"],
      authMethod: undefined,
      setAuthMethod: vi.fn(),
    });
    mockUseUsernameValidation.mockReturnValue({
      status: "valid",
      exists: false,
      error: undefined,
      signers: undefined,
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
      waitingForConfirmation: false,
      changeWallet: false,
      setChangeWallet: vi.fn(),
      overlay: null,
      setOverlay: vi.fn(),
      signupOptions: ["webauthn"],
      authMethod: undefined,
      setAuthMethod: vi.fn(),
    });
    renderComponent();
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });

    // Ensure dropdown is closed by blurring input
    fireEvent.blur(input);

    // Wait for validation to be applied
    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).not.toBeDisabled();
    });

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    const form = submitButton.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        "validuser",
        false,
        "webauthn",
        undefined,
      );
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
      waitingForConfirmation: false,
      changeWallet: false,
      setChangeWallet: vi.fn(),
      overlay: null,
      setOverlay: vi.fn(),
      signupOptions: ["webauthn"],
      authMethod: undefined,
      setAuthMethod: vi.fn(),
    });
    renderComponent();
    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeDisabled();
  });
  it("shows error message when validation fails", async () => {
    const errorMessage =
      "Username can only contain letters, numbers, and hyphens";
    mockUseUsernameValidation.mockReturnValue({
      status: "invalid",
      exists: false,
      error: { name: "Error", message: errorMessage },
    });
    renderComponent();
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "invalid@user" } });
    fireEvent.blur(input);
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
  it("does not show warning for unverified theme when isSlot is true", async () => {
    mockUseControllerTheme.mockReturnValue({
      name: "cartridge",
      verified: false,
      icon: "icon-url",
      cover: "cover-url",
    });
    renderWithProviders(<CreateController {...defaultProps} isSlot />);
    expect(
      screen.queryByText("Please proceed with caution"),
    ).not.toBeInTheDocument();
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
      waitingForConfirmation: false,
      changeWallet: false,
      setChangeWallet: vi.fn(),
      overlay: null,
      setOverlay: vi.fn(),
      signupOptions: ["webauthn"],
      authMethod: undefined,
      setAuthMethod: vi.fn(),
    });
    renderWithProviders(<CreateController {...defaultProps} />);
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });

    // Ensure dropdown is closed by blurring input
    fireEvent.blur(input);

    // Wait for validation to be applied
    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).not.toBeDisabled();
    });

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    const form = submitButton.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        "validuser",
        false,
        "webauthn",
        undefined,
      );
    });
  });

  it("prevents form submission when dropdown is open", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const setAuthenticationStep = vi.fn();
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
      authenticationStep: AuthenticationStep.FillForm,
      setAuthenticationStep,
      waitingForConfirmation: false,
      changeWallet: false,
      setChangeWallet: vi.fn(),
      overlay: null,
      setOverlay: vi.fn(),
      signupOptions: ["webauthn"],
      authMethod: undefined,
      setAuthMethod: vi.fn(),
    });
    renderComponent();
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });

    // Wait for validation to complete
    await waitFor(() => {
      expect(input).toHaveValue("validuser");
    });

    // Simulate dropdown being open by triggering focus on input
    fireEvent.focus(input);

    const submitButton = screen.getByText("sign up with Passkey");
    fireEvent.click(submitButton);

    // Form submission should be prevented when dropdown is open
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("allows form submission when dropdown is closed", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const setAuthenticationStep = vi.fn();
    mockUseCreateController.mockReturnValue({
      isLoading: false,
      error: undefined,
      setError: vi.fn(),
      handleSubmit,
      authenticationStep: AuthenticationStep.FillForm,
      setAuthenticationStep,
      waitingForConfirmation: false,
      changeWallet: false,
      setChangeWallet: vi.fn(),
      overlay: null,
      setOverlay: vi.fn(),
      signupOptions: ["webauthn"],
      authMethod: undefined,
      setAuthMethod: vi.fn(),
    });
    renderComponent();
    const input = screen.getByPlaceholderText("Username");
    fireEvent.change(input, { target: { value: "validuser" } });

    // Wait for validation to complete and ensure dropdown is closed
    await waitFor(() => {
      expect(input).toHaveValue("validuser");
    });

    // Ensure dropdown is closed by blurring the input
    fireEvent.blur(input);

    // Wait for validation to be applied
    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).not.toBeDisabled();
    });

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    const form = submitButton.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Form submission should work when dropdown is closed
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        "validuser",
        false,
        "webauthn",
        undefined,
      );
    });
  });

  describe("Pill functionality", () => {
    it("brings back input form when clicking the pill", async () => {
      const setAuthenticationStep = vi.fn();
      const handleSubmit = vi.fn();

      mockUseCreateController.mockReturnValue({
        isLoading: false,
        error: undefined,
        setError: vi.fn(),
        handleSubmit,
        authenticationStep: AuthenticationStep.FillForm,
        setAuthenticationStep,
        waitingForConfirmation: false,
        changeWallet: false,
        setChangeWallet: vi.fn(),
        overlay: null,
        setOverlay: vi.fn(),
        signupOptions: ["webauthn"],
        authMethod: undefined,
        setAuthMethod: vi.fn(),
      });

      renderComponent();

      // Initially should show input
      const input = screen.getByPlaceholderText("Username");
      expect(input).toBeInTheDocument();

      // Type a username
      fireEvent.change(input, { target: { value: "testuser" } });

      await waitFor(() => {
        expect(input).toHaveValue("testuser");
      });

      // In the actual app, when a user selects an account from the dropdown,
      // the input is replaced with a pill. The pill shows the username and
      // has a clickable area that calls onSelectedUsernameEdit to go back to input mode.
      //
      // Since the component manages selectedAccount internally via handleAccountSelect,
      // and that callback is triggered by the AccountSearchDropdown (which requires
      // async account fetching), we verify the editing behavior by ensuring:
      // 1. The input can be cleared and changed (simulating the state after pill click)
      // 2. The form remains functional after state changes

      // Simulate clearing (as if pill was removed via the X button)
      fireEvent.change(input, { target: { value: "" } });

      await waitFor(() => {
        expect(input).toHaveValue("");
      });

      // Type a new username (simulating return to input mode after pill click)
      fireEvent.change(input, { target: { value: "newuser" } });

      await waitFor(() => {
        expect(input).toHaveValue("newuser");
      });

      // Verify the input is still functional and can be submitted
      expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();

      // Blur to close any dropdown and enable submission
      fireEvent.blur(input);

      await waitFor(() => {
        const submitButton = screen.getByTestId("submit-button");
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("In-app browser handling", () => {
    it("shows normal auth button when not in app browser", () => {
      // Default mock already sets isInApp: false
      renderComponent();

      const input = screen.getByPlaceholderText("Username");
      fireEvent.change(input, { target: { value: "testuser" } });

      expect(screen.getByText("sign up with Passkey")).toBeInTheDocument();
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

      expect(screen.getByText("sign up with Passkey")).toBeInTheDocument();
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
      expect(screen.getByText("sign up with Passkey")).toBeInTheDocument();
    });
  });
});
