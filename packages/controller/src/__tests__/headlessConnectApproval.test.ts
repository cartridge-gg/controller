import { ResponseCodes } from "../types";

let iframeOpen: jest.Mock | undefined;

// Mock the KeychainIFrame so we can manually trigger onSessionCreated.
jest.mock("../iframe/keychain", () => ({
  KeychainIFrame: jest.fn().mockImplementation((_opts: any) => {
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
  test("does not open UI and resolves connect() only after keychain.connect()", async () => {
    const controller = new ControllerProvider();

    let resolveConnect: ((value: any) => void) | undefined;
    const connectPromise = new Promise((resolve) => {
      resolveConnect = resolve;
    });

    const keychain = {
      connect: jest.fn().mockReturnValue(connectPromise),
      disconnect: jest.fn(),
      reset: jest.fn(),
    } as any;

    // Avoid waiting for Penpal connection in this unit test.
    (controller as any).keychain = keychain;
    (controller as any).waitForKeychain = () => Promise.resolve();

    const accountsChanged = jest.fn();
    controller.on("accountsChanged", accountsChanged as any);

    const controllerConnectPromise = controller.connect({
      username: "alice",
      signer: "webauthn",
    });

    let resolved = false;
    void controllerConnectPromise.then(() => {
      resolved = true;
    });

    // Flush microtasks for:
    // 1) await waitForKeychain()
    // 2) await keychain.connect(...)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(keychain.connect).toHaveBeenCalledWith({
      username: "alice",
      signer: "webauthn",
      password: undefined,
    });
    expect(iframeOpen).not.toHaveBeenCalled();
    expect(resolved).toBe(false);

    resolveConnect?.({
      code: ResponseCodes.SUCCESS,
      address: "0xabc",
    });

    const account = await controllerConnectPromise;
    expect(account?.address).toBe("0xabc");
    expect(accountsChanged).toHaveBeenCalledWith(["0xabc"]);

    // Subsequent connect() should short-circuit (no second approval flow).
    const account2 = await controller.connect();
    expect(account2?.address).toBe("0xabc");
    expect(keychain.connect).toHaveBeenCalledTimes(1);
  });
});
