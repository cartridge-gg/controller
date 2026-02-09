import { ResponseCodes } from "../types";

let capturedOnSessionCreated: (() => void | Promise<void>) | undefined;
let iframeOpen: jest.Mock | undefined;

// Mock the KeychainIFrame so we can manually trigger onSessionCreated.
jest.mock("../iframe/keychain", () => ({
  KeychainIFrame: jest.fn().mockImplementation((opts: any) => {
    capturedOnSessionCreated = opts?.onSessionCreated;
    iframeOpen = jest.fn();
    return {
      open: iframeOpen,
      close: jest.fn(),
    };
  }),
}));

// Keep ControllerAccount lightweight for this test.
jest.mock("../account", () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (
        _provider: unknown,
        _rpcUrl: string,
        address: string,
        _keychain: unknown,
        _options: unknown,
      ) => ({
        address,
      }),
    ),
}));

import ControllerProvider from "../controller";

describe("headless connect requiring approval", () => {
  test("resolves connect() only after onSessionCreated and emits approval complete", async () => {
    const controller = new ControllerProvider();

    const keychain = {
      headlessConnect: jest.fn().mockResolvedValue({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        requestId: "req_123",
      }),
      navigate: jest.fn().mockResolvedValue(undefined),
      probe: jest.fn().mockResolvedValue({
        code: ResponseCodes.SUCCESS,
        address: "0xabc",
      }),
      disconnect: jest.fn(),
      reset: jest.fn(),
    } as any;

    // Avoid waiting for Penpal connection in this unit test.
    (controller as any).keychain = keychain;
    (controller as any).waitForKeychain = () => Promise.resolve();

    const approvalHandler = jest.fn();
    controller.onHeadlessApprovalComplete(approvalHandler);

    const connectPromise = controller.connect({
      username: "alice",
      signer: "webauthn",
    });

    let resolved = false;
    void connectPromise.then(() => {
      resolved = true;
    });

    // Flush microtasks for:
    // 1) await waitForKeychain()
    // 2) await headlessConnect(...)
    // 3) await navigate(...)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(keychain.headlessConnect).toHaveBeenCalledWith({
      username: "alice",
      signer: "webauthn",
      password: undefined,
    });
    expect(keychain.navigate).toHaveBeenCalledWith(
      "/headless-approval/req_123",
    );
    expect(iframeOpen).toHaveBeenCalled();
    expect(resolved).toBe(false);

    expect(capturedOnSessionCreated).toBeDefined();
    await capturedOnSessionCreated?.();

    const account = await connectPromise;
    expect(account?.address).toBe("0xabc");
    expect(approvalHandler).toHaveBeenCalledWith(
      expect.objectContaining({ address: "0xabc" }),
    );

    // Subsequent connect() should short-circuit (no second approval flow).
    const account2 = await controller.connect();
    expect(account2?.address).toBe("0xabc");
    expect(keychain.headlessConnect).toHaveBeenCalledTimes(1);
    expect(keychain.navigate).toHaveBeenCalledTimes(1);
  });
});
