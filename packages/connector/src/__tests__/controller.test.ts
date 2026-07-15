import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock controller SDK so ControllerConnector doesn't need a real iframe/keychain.
vi.mock("@cartridge/controller", () => {
  class ControllerProvider {
    id = "controller";
    name = "Controller";
    account?: { address: string };

    constructor() {
      if (typeof window !== "undefined") {
        (window as any).starknet_controller = this;
      }
    }

    async connect(): Promise<{ address: string } | undefined> {
      this.account = { address: "0xabc" };
      return this.account;
    }

    request = vi.fn(async (call: { type: string; params?: unknown }) => {
      if (call.type === "wallet_requestChainId") return "0x1";
      if (call.type === "wallet_switchStarknetChain") return true;
      throw new Error(`Unexpected request: ${call.type}`);
    });

    disconnect() {}
    username() {}
    isReady() {
      return true;
    }
    delegateAccount() {}
    asWalletStandard() {
      return { name: this.name };
    }
  }

  return {
    __esModule: true,
    default: ControllerProvider,
  };
});

import ControllerConnector from "../controller";

describe("ControllerConnector", () => {
  beforeEach(() => {
    (globalThis as any).window = {};
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it("returns the address from controller.connect()", async () => {
    const connector = new ControllerConnector();

    const result = await connector.connect();

    expect(result.account).toBe("0xabc");
    expect(result.chainId).toBe(1n);
    expect((window as any).starknet_controller).toBe(connector.controller);
  });

  it("returns the wallet's actual chain without a hint", async () => {
    const connector = new ControllerConnector();
    connector.controller.request = vi.fn(async () => "0x534e5f4d41494e");

    const result = await connector.connect();

    expect(result.chainId).toBe(0x534e5f4d41494en);
    expect(connector.controller.request).toHaveBeenCalledTimes(1);
    expect(connector.controller.request).toHaveBeenCalledWith({
      type: "wallet_requestChainId",
    });
  });

  it("does not switch when the wallet already matches the hint", async () => {
    const connector = new ControllerConnector();
    connector.controller.request = vi.fn(async () => "0x2a");

    const result = await connector.connect({ chainIdHint: 42n });

    expect(result.chainId).toBe(42n);
    expect(connector.controller.request).toHaveBeenCalledTimes(1);
  });

  it("switches a mismatched wallet and returns the chain after switching", async () => {
    const connector = new ControllerConnector();
    connector.controller.request = vi
      .fn()
      .mockResolvedValueOnce("0x1")
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce("0x2a");

    const result = await connector.connect({ chainIdHint: 42n });

    expect(result.chainId).toBe(42n);
    expect(connector.controller.request).toHaveBeenNthCalledWith(2, {
      type: "wallet_switchStarknetChain",
      params: { chainId: "0x2a" },
    });
    expect(connector.controller.request).toHaveBeenNthCalledWith(3, {
      type: "wallet_requestChainId",
    });
  });

  it("propagates a rejected chain switch", async () => {
    const connector = new ControllerConnector();
    const rejection = new Error("Switch rejected");
    connector.controller.request = vi
      .fn()
      .mockResolvedValueOnce("0x1")
      .mockRejectedValueOnce(rejection);

    await expect(connector.connect({ chainIdHint: 42n })).rejects.toBe(
      rejection,
    );
  });

  it("rejects when the wallet returns false for a chain switch", async () => {
    const connector = new ControllerConnector();
    connector.controller.request = vi
      .fn()
      .mockResolvedValueOnce("0x1")
      .mockResolvedValueOnce(false);

    await expect(connector.connect({ chainIdHint: 42n })).rejects.toThrow(
      "Controller rejected chain switch to 0x2a",
    );
  });

  it("rejects when the wallet remains on a mismatched chain", async () => {
    const connector = new ControllerConnector();
    connector.controller.request = vi
      .fn()
      .mockResolvedValueOnce("0x1")
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce("0x1");

    await expect(connector.connect({ chainIdHint: 42n })).rejects.toThrow(
      "Controller chain mismatch after switch: expected 0x2a, received 0x1",
    );
  });
});
