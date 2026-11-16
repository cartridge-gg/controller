import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResponseCodes } from "@cartridge/controller";

const mockFetchController = vi.fn();
const mockGenerateStarknetKeypair = vi.fn();
const mockEncryptPrivateKey = vi.fn();
const mockComputeAccountAddress = vi.fn();
const mockControllerLogin = vi.fn();
const mockGetIpLocation = vi.fn();

vi.mock("@/components/connect/create/utils", () => ({
  fetchController: (...args: unknown[]) => mockFetchController(...args),
}));

vi.mock("@/components/connect/create/password/crypto", () => ({
  decryptPrivateKey: vi.fn(),
  encryptPrivateKey: (...args: unknown[]) => mockEncryptPrivateKey(...args),
  generateStarknetKeypair: () => mockGenerateStarknetKeypair(),
}));

vi.mock("@/components/provider/upgrade", () => ({
  STABLE_CONTROLLER: { hash: "0xclasshash" },
}));

vi.mock("@/hooks/account", () => ({
  doSignup: vi.fn(),
}));

vi.mock("@cartridge/controller-wasm", () => ({
  computeAccountAddress: (...args: unknown[]) =>
    mockComputeAccountAddress(...args),
}));

vi.mock("./headless-requests", () => ({
  createHeadlessApprovalRequest: vi.fn(),
  hasPendingHeadlessApproval: vi.fn(() => false),
}));

vi.mock("./session-creation", () => ({
  createVerifiedSession: vi.fn(),
  requiresSessionApproval: vi.fn(() => false),
}));

vi.mock("@/utils/controller", () => ({
  default: {
    login: (...args: unknown[]) => mockControllerLogin(...args),
    create: vi.fn(),
  },
}));

vi.mock("@/utils/ip", () => ({
  getIpLocation: () => mockGetIpLocation(),
}));

describe("headless connect auto-signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIpLocation.mockResolvedValue({
      countryCode: "CA",
      regionCode: "CA-ON",
    });
  });

  it("requires the GPS-capable UI flow for a US headless user", async () => {
    mockGetIpLocation.mockResolvedValue({
      countryCode: "US",
      regionCode: "US-CA",
    });
    const { headlessConnect } = await import("./headless");
    const connect = headlessConnect({
      setController: vi.fn(),
      getParent: vi.fn(() => undefined),
      getConnectionState: () => ({
        rpcUrl: "https://rpc.example",
        isPoliciesResolved: true,
        isConfigLoading: false,
      }),
      getLocationGate: () => ({ blocked: ["US-NY"] }),
    })("https://game.example");

    await expect(
      connect({ username: "alice", signer: "password", password: "pw" }),
    ).resolves.toEqual({
      code: ResponseCodes.ERROR,
      message:
        "Location verification is required. Use the UI connect flow instead.",
    });
    expect(mockControllerLogin).not.toHaveBeenCalled();
  });

  it("rejects signup when username does not exist", async () => {
    mockFetchController.mockRejectedValue(
      new Error("ent: controller not found"),
    );

    const { headlessConnect } = await import("./headless");
    const setController = vi.fn();
    const connect = headlessConnect({
      setController,
      getParent: vi.fn(() => undefined),
      getConnectionState: () => ({
        origin: "https://game.example",
        chainId: "0x534e5f4d41494e",
        rpcUrl: "https://rpc.example",
        policies: undefined,
        isPoliciesResolved: true,
        isConfigLoading: false,
      }),
      getLocationGate: () => ({ blocked: ["US-NY"] }),
    })("https://game.example");

    await expect(
      connect({ username: "alice", signer: "password", password: "pw" }),
    ).resolves.toEqual({
      code: ResponseCodes.ERROR,
      message: "New account signups are currently disabled",
    });
    expect(mockControllerLogin).not.toHaveBeenCalled();
    expect(setController).not.toHaveBeenCalled();
  });
});
