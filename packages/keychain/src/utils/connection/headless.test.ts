import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResponseCodes } from "@cartridge/controller";

const mockFetchController = vi.fn();
const mockGenerateStarknetKeypair = vi.fn();
const mockEncryptPrivateKey = vi.fn();
const mockComputeAccountAddress = vi.fn();
const mockControllerLogin = vi.fn();

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

describe("headless connect auto-signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new password account when username does not exist", async () => {
    const mockController = {
      address: vi.fn(() => "0xnew"),
      register: vi.fn().mockResolvedValue({ register: { username: "alice" } }),
    };

    mockFetchController.mockRejectedValue(
      new Error("ent: controller not found"),
    );
    mockGenerateStarknetKeypair.mockReturnValue({
      privateKey: "0xpriv",
      publicKey: "0xpub",
    });
    mockEncryptPrivateKey.mockResolvedValue("enc");
    mockComputeAccountAddress.mockReturnValue("0xcomputed");
    mockControllerLogin.mockResolvedValue({
      controller: mockController,
      session: {
        expiresAt: "1",
        guardianKeyGuid: "0x0",
        metadataHash: "0x0",
        sessionKeyGuid: "0x1",
        allowedPoliciesRoot: "0x0",
        authorization: [],
      },
    });

    const { headlessConnect } = await import("./headless");
    const setController = vi.fn();
    const getParent = vi.fn(() => undefined);
    const getConnectionState = () => ({
      origin: "https://game.example",
      chainId: "0x534e5f4d41494e",
      rpcUrl: "https://rpc.example",
      policies: undefined,
      isPoliciesResolved: true,
      isConfigLoading: false,
    });

    const connect = headlessConnect({
      setController,
      getParent,
      getConnectionState,
    })("https://game.example");

    const result = await connect({
      username: "alice",
      signer: "password",
      password: "pw",
    });

    expect(result).toEqual({
      code: ResponseCodes.SUCCESS,
      address: "0xnew",
    });
    expect(mockControllerLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "alice",
        isControllerRegistered: false,
      }),
    );
    expect(mockController.register).toHaveBeenCalled();
    expect(setController).toHaveBeenCalledWith(mockController);
  });
});
