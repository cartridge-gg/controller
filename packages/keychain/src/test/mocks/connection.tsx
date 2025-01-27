import { ReactNode } from "react";
import { vi } from "vitest";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "@/components/provider/connection";
import { LATEST_CONTROLLER } from "@/hooks/upgrade";
import { render, RenderResult } from "@testing-library/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultMockController: any = {
  estimateInvokeFee: vi.fn().mockImplementation(async () => ({
    suggestedMaxFee: BigInt(1000),
  })),
} as const;

export const defaultMockConnection: ConnectionContextValue = {
  upgrade: {
    available: false,
    error: undefined,
    latest: LATEST_CONTROLLER,
    calls: [],
    isSynced: false,
    isUpgrading: false,
    onUpgrade: vi.fn(),
  },
  closeModal: vi.fn(),
  openModal: vi.fn(),
  logout: vi.fn(),
  context: undefined,
  origin: "https://test.com",
  rpcUrl: "https://test.rpc.com",
  chainId: "1",
  chainName: "testnet",
  theme: {
    verified: true,
    name: "name",
    cover: "cover",
    icon: "icon",
  },
  hasPrefundRequest: false,
  setController: vi.fn(),
  setContext: vi.fn(),
  openSettings: vi.fn(),
  controller: defaultMockController,
};

export function createMockConnection(
  overrides?: Partial<ConnectionContextValue>,
): ConnectionContextValue {
  return {
    ...defaultMockConnection,
    ...overrides,
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
    useChainId: () => mockConnection.chainId,
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
  return render(withConnection(ui, connectionOverrides));
}
