import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "./index";

const mockUseConnectionValue = vi.fn();
const mockController = {
  username: vi.fn().mockReturnValue("testuser"),
  address: vi.fn().mockReturnValue("0x123456789abcdef"),
  chainId: vi.fn().mockReturnValue(0n),
};
const mockUseConnection = {
  controller: mockController,
};

vi.mock("@/hooks/connection", () => ({
  useConnectionValue: () => mockUseConnectionValue(),
  useConnection: () => mockUseConnection,
}));

vi.mock("@/components/provider/upgrade", () => ({
  UpgradeProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/hooks/wallets", () => ({
  WalletsProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="wallets-provider">{children}</div>
  ),
}));

vi.mock("@/utils/graphql", () => ({
  ENDPOINT: "https://example.com",
}));

vi.mock("@auth0/auth0-react", () => ({
  Auth0Provider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@starknet-react/chains", () => ({
  mainnet: {},
  sepolia: {},
}));

vi.mock("@starknet-react/core", () => ({
  cartridge: {},
  jsonRpcProvider: vi.fn(() => ({})),
  StarknetConfig: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@turnkey/sdk-react", () => ({
  TurnkeyProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("react-query", () => ({
  QueryClient: class {},
  QueryClientProvider: ({ children }: PropsWithChildren) => <>{children}</>,
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock("starknet", () => ({
  constants: {
    StarknetChainId: {
      SN_MAIN: "SN_MAIN",
      SN_SEPOLIA: "SN_SEPOLIA",
    },
  },
  num: {
    toBigInt: () => 0n,
  },
  getChecksumAddress: vi.fn((addr: string) => addr),
}));

vi.mock("./posthog", () => ({
  PostHogProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("./tokens", () => ({
  TokensProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("./ui", () => ({
  UIProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/hooks/features", () => ({
  FeatureProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/components/provider/arcade", () => ({
  ArcadeProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/components/provider/data", () => ({
  DataProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/context", () => ({
  ToastProvider: ({ children }: PropsWithChildren) => <>{children}</>,
  StarterpackProviders: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/context/quest", () => ({
  QuestProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@cartridge/controller-ui/utils/api/indexer", () => ({
  IndexerAPIProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@cartridge/controller-ui/utils/api/cartridge", () => ({
  CartridgeAPIProvider: ({ children }: PropsWithChildren) => <>{children}</>,
  CartridgeAPIContext: vi.fn(() => ({ url: "" })),
  useMeQuery: vi.fn(() => ({ data: {} })),
  useSendEmailVerificationMutation: vi.fn(() => ({})),
  useSendPhoneVerificationMutation: vi.fn(() => ({})),
  useVerifyEmailMutation: vi.fn(() => ({})),
  useVerifyPhoneMutation: vi.fn(() => ({})),
}));

vi.mock("@cartridge/controller-ui/utils", () => ({
  useCartridgeAPI: vi.fn(() => ({})),
}));

vi.mock("@/utils/api", () => ({
  useAccountPrivateQuery: vi.fn(() => ({})),
  useAccountVerifyMutation: vi.fn(() => ({})),
}));

vi.mock("../ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/components/identity/provider", () => ({
  IdentityProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@cartridge/arcade/marketplace/react", () => ({
  MarketplaceClientProvider: ({ children }: PropsWithChildren) => (
    <>{children}</>
  ),
}));

vi.mock("@cartridge/controller-ui", () => ({
  SpinnerIcon: () => <div data-testid="loading-spinner" />,
  isValidCalendarDate: () => true,
}));

const baseConnection = {
  parent: undefined,
  controller: undefined,
  origin: "",
  rpcUrl: "https://rpc.example.com",
  project: null,
  namespace: null,
  propagateError: false,
  webauthnPopup: {
    create: false,
    get: false,
  },
  preset: null,
  policiesStr: null,
  theme: {
    name: "default",
    verified: true,
  },
  isConfigLoading: false,
  isPoliciesResolved: true,
  isPoliciesError: false,
  isMainnet: false,
  verified: true,
  chainId: undefined,
  setController: vi.fn(),
  controllerVersion: undefined,
  setRpcUrl: vi.fn(),
  openModal: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  openSettings: vi.fn(),
  externalDetectWallets: vi.fn().mockResolvedValue([]),
  externalConnectWallet: vi.fn(),
  externalSignTypedData: vi.fn(),
  externalSignMessage: vi.fn(),
  externalSendTransaction: vi.fn(),
  externalGetBalance: vi.fn(),
  externalWaitForTransaction: vi.fn(),
  locationGate: undefined,
  ageGate: undefined,
  locationGateVerified: false,
  setLocationGateVerified: vi.fn(),
};

describe("Provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConnectionValue.mockReturnValue(baseConnection);
  });

  it("shows a loading spinner while preset config is loading", () => {
    mockUseConnectionValue.mockReturnValue({
      ...baseConnection,
      isConfigLoading: true,
    });

    render(
      <Provider>
        <div>child content</div>
      </Provider>,
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByText("child content")).not.toBeInTheDocument();
  });

  it("renders children once preset config loading has finished", () => {
    render(
      <Provider>
        <div>child content</div>
      </Provider>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  it("keeps the provider tree mounted while config is loading", () => {
    // Regression guard: if the loading branch short-circuits above the
    // provider tree, it unmounts child providers mid-flight. OAuth redirect
    // flows register embedded wallets on window.keychain_wallets before
    // triggering a preset reload; those registrations must survive the
    // loading state.
    const { rerender } = render(
      <Provider>
        <div>child content</div>
      </Provider>,
    );

    expect(screen.getByTestId("wallets-provider")).toBeInTheDocument();
    const walletsProviderBefore = screen.getByTestId("wallets-provider");

    mockUseConnectionValue.mockReturnValue({
      ...baseConnection,
      isConfigLoading: true,
    });
    rerender(
      <Provider>
        <div>child content</div>
      </Provider>,
    );

    // Spinner replaces children, but WalletsProvider is still mounted
    // (same DOM node instance — React kept it alive across the rerender).
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByTestId("wallets-provider")).toBe(walletsProviderBefore);
  });
});
