import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "./index";

const mockUseConnectionValue = vi.fn();

vi.mock("@/hooks/connection", () => ({
  useConnectionValue: () => mockUseConnectionValue(),
}));

vi.mock("@/components/provider/upgrade", () => ({
  UpgradeProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/hooks/wallets", () => ({
  WalletsProvider: ({ children }: PropsWithChildren) => <>{children}</>,
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

vi.mock("@cartridge/ui/utils/api/indexer", () => ({
  IndexerAPIProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@cartridge/ui/utils/api/cartridge", () => ({
  CartridgeAPIProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("../ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock("@cartridge/arcade/marketplace/react", () => ({
  MarketplaceClientProvider: ({ children }: PropsWithChildren) => (
    <>{children}</>
  ),
}));

vi.mock("@cartridge/ui", () => ({
  SpinnerIcon: () => <div data-testid="loading-spinner" />,
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
});
