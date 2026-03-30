import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock starknet-react's InjectedConnector so we can control what super.connect returns.
vi.mock("@starknet-react/core", () => {
  type InjectedConnectorOptions = { id: string; name?: string };

  class InjectedConnector {
    private readonly _options: InjectedConnectorOptions;

    constructor({ options }: { options: InjectedConnectorOptions }) {
      this._options = options;
    }

    get id(): string {
      return this._options.id;
    }

    get name(): string {
      return this._options.name ?? this._options.id;
    }

    // Simulate an edge case where the injected request resolves but returns an
    // empty/undefined account. Our connector should still return the address
    // from controller.connect().
    async connect(): Promise<{ account?: string; chainId?: bigint }> {
      return { account: undefined, chainId: 1n };
    }

    async disconnect(): Promise<void> {}
  }

  // The real module exports both, but ControllerConnector only needs InjectedConnector.
  class Connector {}

  return { Connector, InjectedConnector };
});

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
    asWalletStandard() {}
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

  it("returns the address from controller.connect() even if injected connect has no account", async () => {
    const connector = new ControllerConnector();

    const result = await connector.connect();

    expect(result.account).toBe("0xabc");
    expect((window as any).starknet_controller).toBe(connector.controller);
  });
});
