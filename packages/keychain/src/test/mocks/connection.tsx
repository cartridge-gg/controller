import { ReactNode } from "react";
import { vi } from "vitest";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "@/components/provider/connection";
import { render, RenderResult } from "@testing-library/react";
import { constants } from "starknet";
import { SemVer } from "semver";
import { BrowserRouter } from "react-router-dom";
import { NavigationProvider } from "@/context/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultMockController: any = {
  estimateInvokeFee: vi.fn().mockImplementation(async () => ({
    suggestedMaxFee: BigInt(1000),
  })),
  chainId: vi.fn().mockImplementation(() => constants.StarknetChainId.SN_MAIN),
} as const;

export const defaultMockConnection: ConnectionContextValue = {
  closeModal: vi.fn(),
  openModal: vi.fn(),
  logout: vi.fn(),
  origin: "https://test.com",
  rpcUrl: "https://test.rpc.com",
  chainId: "SN_MAIN",
  parent: undefined,
  project: null,
  namespace: null,
  verified: false,
  isConfigLoading: false,
  isMainnet: false,
  theme: {
    verified: true,
    name: "test",
    icon: "test-icon",
    cover: "test-cover",
  },
  propagateError: false,
  setController: vi.fn(),
  setRpcUrl: vi.fn(),
  openSettings: vi.fn(),
  controller: defaultMockController,
  externalDetectWallets: vi.fn(),
  externalConnectWallet: vi.fn(),
  externalSignMessage: vi.fn(),
  externalSignTypedData: vi.fn(),
  externalSendTransaction: vi.fn(),
  externalGetBalance: vi.fn(),
  externalWaitForTransaction: vi.fn(),
  controllerVersion: new SemVer("1.0.0"),
};

export function createMockConnection(
  overrides?: Partial<ConnectionContextValue>,
): ConnectionContextValue {
  return {
    ...defaultMockConnection,
    ...overrides,
    controller: overrides?.controller
      ? { ...defaultMockController, ...overrides.controller }
      : defaultMockController,
    theme: overrides?.theme
      ? { ...defaultMockConnection.theme, ...overrides.theme }
      : defaultMockConnection.theme,
  };
}

export function MockConnectionProvider({
  children,
  connection = defaultMockConnection,
}: {
  children: ReactNode;
  connection?: ConnectionContextValue;
}) {
  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  );
}

// Helper for mocking the useConnection hook
export function mockUseConnection(overrides?: Partial<ConnectionContextValue>) {
  const mockConnection = createMockConnection({
    ...overrides,
    controller: overrides?.controller
      ? { ...defaultMockController, ...overrides.controller }
      : defaultMockController,
  });

  vi.mock("@/hooks/connection", () => ({
    useConnection: () => mockConnection,
  }));

  return mockConnection;
}

export function withConnection(
  children: ReactNode,
  connectionOverrides?: Partial<ConnectionContextValue>,
) {
  const connection = createMockConnection(connectionOverrides);
  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function renderWithConnection(
  ui: ReactNode,
  connectionOverrides?: Partial<ConnectionContextValue>,
): RenderResult {
  return render(
    <BrowserRouter>
      <NavigationProvider>
        {withConnection(ui, connectionOverrides)}
      </NavigationProvider>
    </BrowserRouter>,
  );
}
