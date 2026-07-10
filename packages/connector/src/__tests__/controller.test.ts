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
    expect((window as any).starknet_controller).toBe(connector.controller);
  });
});
