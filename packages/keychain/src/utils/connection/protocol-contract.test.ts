import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * jsdom protocol harness for the hosted keychain.
 *
 * This imports the production `connectToController` registration and captures
 * the exact method table at the `connectToParent` (Penpal) boundary. Method
 * implementations are replaced with deterministic spies so the contract can
 * run in jsdom without an account, popup, or RPC. Behavioral parsing for the
 * two connect generations is covered separately by connect.test.ts.
 *
 * Keep this test unchanged during the Starknet.js v10 migration: the same
 * hosted keychain must continue to accept the 0.13.12+ wire protocol.
 */
type ProtocolMethod = (origin: string) => (...args: unknown[]) => unknown;

const contract = vi.hoisted(() => ({
  methods: {} as Record<string, ProtocolMethod>,
  connect: vi.fn(),
  deploy: vi.fn(),
  execute: vi.fn(),
  estimateInvokeFee: vi.fn(),
  probe: vi.fn(),
  signMessage: vi.fn(),
  openSettings: vi.fn(),
  navigate: vi.fn(),
  credits: vi.fn(),
  openLocationPrompt: vi.fn(),
  switchChain: vi.fn(),
  updateSession: vi.fn(),
  createConnectHandler: vi.fn(),
  connectToParent: vi.fn(),
}));

vi.mock("@cartridge/penpal", () => ({
  connectToParent: contract.connectToParent.mockImplementation(
    ({ methods }: { methods: Record<string, ProtocolMethod> }) => {
      contract.methods = methods;
      return {
        promise: Promise.resolve({ origin: "https://game.example" }),
        destroy: vi.fn(),
      };
    },
  ),
}));

vi.mock("@cartridge/controller-ui/utils", () => ({
  normalize: (method: ProtocolMethod) => method,
}));

vi.mock("@/hooks/connection", () => ({
  PRESERVE_URL_PARAMS_FLAG: "keychain.preserveOnReload",
}));

vi.mock("@/utils/controller", () => ({ default: class Controller {} }));

vi.mock("./connect", () => ({
  connect: () => () => vi.fn(),
}));

vi.mock("./credits", () => ({
  creditsFactory: () => contract.credits,
}));

vi.mock("./deploy", () => ({
  deployFactory: () => contract.deploy,
}));

vi.mock("./estimate", () => ({
  estimateInvokeFee: contract.estimateInvokeFee,
}));

vi.mock("./execute", () => ({
  execute:
    () =>
    (origin: string) =>
    (...args: unknown[]) =>
      contract.execute(origin, ...args),
}));

vi.mock("./headless", () => ({
  headlessConnect: () => vi.fn(),
}));

vi.mock("./probe", () => ({
  probe:
    () =>
    (origin: string) =>
    (...args: unknown[]) =>
      contract.probe(origin, ...args),
}));

vi.mock("./settings", () => ({
  openSettingsFactory: () => contract.openSettings,
}));

vi.mock("./sign", () => ({
  signMessageFactory:
    () =>
    (origin: string) =>
    (...args: unknown[]) =>
      contract.signMessage(origin, ...args),
}));

vi.mock("./switchChain", () => ({
  switchChain: () => contract.switchChain,
}));

vi.mock("./navigate", () => ({
  navigateFactory: () => contract.navigate,
}));

vi.mock("./update-session", () => ({
  updateSession:
    () =>
    () =>
    (...args: unknown[]) =>
      contract.updateSession(...args),
}));

vi.mock("./headless-requests", () => ({
  waitForHeadlessApprovalRequest: vi.fn(),
}));

vi.mock("./connect-routing", () => ({
  createConnectHandler: contract.createConnectHandler.mockImplementation(
    () =>
      (...args: unknown[]) =>
        contract.connect(...args),
  ),
}));

vi.mock("./location", () => ({
  locationPromptFactory: () => contract.openLocationPrompt,
}));

import { connectToController, scheduleKeychainReload } from "./index";

const PUBLISHED_0_13_12_METHODS = [
  "connect",
  "delegateAccount",
  "deploy",
  "disconnect",
  "estimateInvokeFee",
  "execute",
  "logout",
  "navigate",
  "openBundle",
  "openLocationPrompt",
  "openPurchaseCredits",
  "openSettings",
  "openStarterPack",
  "probe",
  "reset",
  "signMessage",
  "switchChain",
  "updateSession",
  "username",
] as const;

const setupProtocol = () => {
  const setController = vi.fn();
  const setRpcUrl = vi.fn();
  const navigate = vi.fn();

  connectToController({
    setController,
    setRpcUrl,
    navigate,
    getParent: () => undefined,
    getConnectionState: () => ({
      origin: "https://game.example",
      rpcUrl: "https://rpc.example",
      policies: undefined,
      chainId: "0x1",
      isPoliciesResolved: true,
      isConfigLoading: false,
    }),
  });

  return { setController, setRpcUrl, navigate };
};

const assertPlainPayload = (payload: unknown) => {
  expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
};

describe("Controller 0.13.12+ hosted-keychain protocol contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contract.methods = {};
  });

  it("keeps the published Penpal method names", () => {
    setupProtocol();

    expect(Object.keys(contract.methods)).toEqual(
      expect.arrayContaining([...PUBLISHED_0_13_12_METHODS]),
    );
    // Later SDK methods are additive; older consumers simply never call them.
    expect(contract.methods).toHaveProperty("credits");
    expect(contract.methods).toHaveProperty("openMerkleDrops");
  });

  it("keeps probe, execute, sign, chain-switch, and session positions", async () => {
    contract.probe.mockResolvedValue({
      code: "SUCCESS",
      address: "0xabc",
      rpcUrl: "https://rpc.example",
    });
    contract.execute.mockResolvedValue({
      code: "SUCCESS",
      transaction_hash: "0xtx",
    });
    contract.signMessage.mockResolvedValue(["0x1", "0x2"]);
    contract.switchChain.mockResolvedValue(undefined);
    contract.updateSession.mockResolvedValue({
      code: "SUCCESS",
      address: "0xabc",
    });
    setupProtocol();

    const origin = "https://game.example";
    const calls = [
      { contractAddress: "0x123", entrypoint: "transfer", calldata: ["0x1"] },
    ];
    const typedData = { domain: { name: "game" }, types: {}, message: {} };
    const policies = {
      contracts: {
        "0x123": { methods: [{ entrypoint: "transfer" }] },
      },
    };

    const probeResult = await contract.methods.probe(origin)(
      "https://rpc.example",
    );
    const executeResult = await contract.methods.execute(origin)(
      calls,
      undefined,
      undefined,
      true,
      "PAYMASTER",
      { code: 1, message: "retry" },
    );
    const legacyManualError = { code: 2, message: "manual approval" };
    const legacyExecuteResult = await contract.methods.execute(origin)(
      calls,
      undefined,
      undefined,
      true,
      legacyManualError,
    );
    const signResult = await contract.methods.signMessage(origin)(
      typedData,
      "0xabc",
      true,
    );
    await contract.methods.switchChain(origin)("https://rpc-2.example");
    const updateResult = await contract.methods.updateSession(origin)(
      policies,
      "game-preset",
    );

    expect(contract.probe).toHaveBeenCalledWith(origin, "https://rpc.example");
    expect(contract.execute).toHaveBeenCalledWith(
      origin,
      calls,
      undefined,
      undefined,
      true,
      "PAYMASTER",
      { code: 1, message: "retry" },
    );
    expect(contract.execute).toHaveBeenNthCalledWith(
      2,
      origin,
      calls,
      undefined,
      undefined,
      true,
      legacyManualError,
    );
    expect(contract.signMessage).toHaveBeenCalledWith(
      origin,
      typedData,
      "0xabc",
      true,
    );
    expect(contract.switchChain).toHaveBeenCalledWith("https://rpc-2.example");
    expect(contract.updateSession).toHaveBeenCalledWith(
      policies,
      "game-preset",
    );
    [
      probeResult,
      executeResult,
      legacyExecuteResult,
      signResult,
      updateResult,
    ].forEach(assertPlainPayload);
  });

  it("accepts both legacy positional connect and current ConnectOptions", async () => {
    contract.connect.mockResolvedValue({ code: "SUCCESS", address: "0xabc" });
    setupProtocol();

    const origin = "https://game.example";
    const legacyPolicies = {
      contracts: {
        "0x123": { methods: [{ entrypoint: "transfer" }] },
      },
    };
    const legacyResult = await contract.methods.connect(origin)(
      legacyPolicies,
      "https://rpc.example",
      ["webauthn"],
    );
    const optionsResult = await contract.methods.connect(origin)({
      signupOptions: ["password"],
    });

    expect(contract.connect).toHaveBeenNthCalledWith(
      1,
      legacyPolicies,
      "https://rpc.example",
      ["webauthn"],
    );
    expect(contract.connect).toHaveBeenNthCalledWith(
      2,
      { signupOptions: ["password"] },
      undefined,
      undefined,
    );
    assertPlainPayload(legacyResult);
    assertPlainPayload(optionsResult);
  });

  it("keeps disconnect cleanup observable before the iframe reload", async () => {
    vi.useFakeTimers();
    const disconnect = vi.fn().mockResolvedValue(undefined);
    window.controller = { disconnect } as typeof window.controller;
    const { setController } = setupProtocol();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await contract.methods.disconnect("https://game.example")();

    expect(setController).toHaveBeenCalledWith(undefined);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem("keychain.preserveOnReload")).toBe("1");
    vi.clearAllTimers();
    vi.useRealTimers();
    consoleError.mockRestore();
  });

  it("defers reload to the task after the Penpal handler resolves", () => {
    vi.useFakeTimers();
    const reload = vi.fn();

    scheduleKeychainReload(reload);
    expect(reload).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(reload).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
