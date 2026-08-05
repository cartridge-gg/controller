import { constants } from "starknet";

import ControllerProvider from "../controller";

const MAINNET = constants.StarknetChainId.SN_MAIN;
const SEPOLIA = constants.StarknetChainId.SN_SEPOLIA;

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function readyController(switchChain: jest.Mock) {
  const controller = new ControllerProvider({ defaultChainId: MAINNET });
  const provider = { getChainId: jest.fn().mockResolvedValue(MAINNET) };

  Object.assign(controller as any, {
    account: { address: "0xabc", provider },
    iframes: { keychain: {} },
    keychain: { switchChain },
  });

  return { controller, provider };
}

describe("ControllerProvider chain switching", () => {
  afterEach(() => jest.restoreAllMocks());

  test("commits the selected chain and account provider only after keychain success", async () => {
    const switchChain = jest.fn().mockResolvedValue(undefined);
    const { controller, provider } = readyController(switchChain);

    await expect(
      controller.request({
        type: "wallet_switchStarknetChain",
        params: { chainId: SEPOLIA },
      }),
    ).resolves.toBe(true);

    expect(switchChain).toHaveBeenCalledWith(
      "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
    );
    await expect(
      controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe(SEPOLIA);
    expect(controller.account?.provider).not.toBe(provider);
  });

  test("preserves the previous authoritative chain and provider on rejection", async () => {
    const rejection = new Error("switch rejected");
    const { controller, provider } = readyController(
      jest.fn().mockRejectedValue(rejection),
    );
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      controller.request({
        type: "wallet_switchStarknetChain",
        params: { chainId: SEPOLIA },
      }),
    ).resolves.toBe(false);

    await expect(
      controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe(MAINNET);
    expect(controller.account?.provider).toBe(provider);
  });

  test("does not expose a target chain while its keychain switch is pending", async () => {
    const pending = deferred();
    const { controller, provider } = readyController(
      jest.fn().mockReturnValue(pending.promise),
    );

    const switching = controller.request({
      type: "wallet_switchStarknetChain",
      params: { chainId: SEPOLIA },
    });
    await Promise.resolve();

    await expect(
      controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe(MAINNET);
    expect(controller.account?.provider).toBe(provider);

    pending.resolve();
    await expect(switching).resolves.toBe(true);
    await expect(
      controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe(SEPOLIA);
  });

  test("serializes overlapping switches and commits them in request order", async () => {
    const first = deferred();
    const second = deferred();
    const switchChain = jest
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { controller } = readyController(switchChain);

    const toSepolia = controller.request({
      type: "wallet_switchStarknetChain",
      params: { chainId: SEPOLIA },
    });
    const backToMainnet = controller.request({
      type: "wallet_switchStarknetChain",
      params: { chainId: MAINNET },
    });
    await Promise.resolve();

    expect(switchChain).toHaveBeenCalledTimes(1);
    first.resolve();
    await expect(toSepolia).resolves.toBe(true);
    await Promise.resolve();
    expect(switchChain).toHaveBeenCalledTimes(2);
    await expect(
      controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe(SEPOLIA);

    second.resolve();
    await expect(backToMainnet).resolves.toBe(true);
    await expect(
      controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe(MAINNET);
  });

  test("isolates throwing network listeners from later subscribers and switch success", async () => {
    const { controller } = readyController(
      jest.fn().mockResolvedValue(undefined),
    );
    const laterListener = jest.fn();
    const error = new Error("listener failed");
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    controller.on("networkChanged", () => {
      throw error;
    });
    controller.on("networkChanged", laterListener);

    await expect(
      controller.request({
        type: "wallet_switchStarknetChain",
        params: { chainId: SEPOLIA },
      }),
    ).resolves.toBe(true);

    expect(laterListener).toHaveBeenCalledWith(SEPOLIA);
    expect(console.error).toHaveBeenCalledWith(
      "networkChanged listener failed",
      error,
    );
  });

  test("returns false without changing state for an unconfigured chain", async () => {
    const { controller, provider } = readyController(jest.fn());
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      controller.request({
        type: "wallet_switchStarknetChain",
        params: { chainId: "0x123" },
      }),
    ).resolves.toBe(false);

    await expect(
      controller.request({ type: "wallet_requestChainId" }),
    ).resolves.toBe(MAINNET);
    expect(controller.account?.provider).toBe(provider);
  });
});
