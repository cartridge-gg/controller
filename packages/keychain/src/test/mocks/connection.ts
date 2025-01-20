import { vi } from "vitest";

export const mockController = {
  estimateInvokeFee: vi.fn(),
};

export const mockConnection = {
  controller: mockController,
  upgrade: {
    available: false,
    inProgress: false,
    error: null,
    start: vi.fn(),
  },
  closeModal: vi.fn(),
  openModal: vi.fn(),
  logout: vi.fn(),
  context: {},
  origin: "https://test.com",
  rpcUrl: "https://test.rpc.com",
  chainId: "1",
  chainName: "testnet",
  policies: {},
  theme: {},
  hasPrefundRequest: false,
  error: null,
  setController: vi.fn(),
  setContext: vi.fn(),
  openSettings: vi.fn(),
};
