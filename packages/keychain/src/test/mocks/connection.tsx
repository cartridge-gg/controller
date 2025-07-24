import { ReactNode } from "react";
import { vi } from "vitest";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "@/components/provider/connection";
import { constants } from "starknet";
import { SemVer } from "semver";

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
  context: undefined,
  origin: "https://test.com",
  rpcUrl: "https://test.rpc.com",
  chainId: "SN_MAIN",
  parent: undefined,
  project: null,
  namespace: null,
  verified: false,
  isConfigLoading: false,
  theme: {
    verified: true,
    name: "test",
    icon: "test-icon",
    cover: "test-cover",
  },
  setController: vi.fn(),
  setContext: vi.fn(),
  openSettings: vi.fn(),
  controller: defaultMockController,
  externalDetectWallets: vi.fn(),
  externalConnectWallet: vi.fn(),
  externalSignMessage: vi.fn(),
  externalSignTypedData: vi.fn(),
  externalSendTransaction: vi.fn(),
  externalGetBalance: vi.fn(),
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
// Functions moved to separate file to fix react-refresh/only-export-components
