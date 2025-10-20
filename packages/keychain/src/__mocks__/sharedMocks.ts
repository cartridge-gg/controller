import { constants } from "starknet";
import { vi } from "vitest";

export const mockPosthog = {
  usePostHog: () => ({
    capture: vi.fn(),
  }),
};

export const mockConnection = {
  controller: {
    chainId: vi
      .fn()
      .mockImplementation(() => constants.StarknetChainId.SN_MAIN),
    estimateInvokeFee: vi.fn().mockImplementation(async () => ({
      suggestedMaxFee: BigInt(1000),
    })),
  },
  upgrade: {
    available: false,
    inProgress: false,
    error: null,
    start: vi.fn(),
  },
  closeModal: vi.fn(),
  openModal: vi.fn(),
  logout: vi.fn(),
  origin: "https://test.com",
  rpcUrl: "https://test.rpc.com",
  chainId: "1",
  chainName: "testnet",
  policies: {},
  theme: {},
  error: null,
  setController: vi.fn(),
  openSettings: vi.fn(),
};

export const mockTheme = {
  useControllerTheme: () => ({
    name: "cartridge",
    verified: true,
    icon: "icon-url",
    cover: "cover-url",
  }),
};

export const mockInAppSpy = {
  default: () => ({
    isInApp: false,
  }),
};
