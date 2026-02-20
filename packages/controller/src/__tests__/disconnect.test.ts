import ControllerProvider from "../controller";

type MockStorage = {
  [key: string]: string;
};

const createMockLocalStorage = () => {
  const store: MockStorage = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => {
        delete store[key];
      });
    }),
    getItem: jest.fn((key: string) => (key in store ? store[key] : null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  } as Storage;
};

describe("ControllerProvider.disconnect", () => {
  const originalLocalStorage = (global as any).localStorage;

  beforeEach(() => {
    (global as any).localStorage = createMockLocalStorage();
  });

  afterEach(() => {
    (global as any).localStorage = originalLocalStorage;
    jest.restoreAllMocks();
  });

  test("cleans persisted connector/session localStorage keys", async () => {
    const controller = new ControllerProvider({});
    const keychainDisconnect = jest.fn().mockResolvedValue(undefined);
    (controller as any).keychain = {
      disconnect: keychainDisconnect,
    };

    localStorage.setItem("lastUsedConnector", "controller");
    localStorage.setItem(
      "@cartridge/account/0x40bda2fcd37963c0b8f951801c63a88132feb399dab0f5318245b2c59a553af/0x534e5f5345504f4c4941",
      JSON.stringify({ Controller: {} }),
    );
    localStorage.setItem("@cartridge/active", JSON.stringify({ Active: {} }));
    localStorage.setItem(
      "@cartridge/https://x.cartridge.gg/active",
      JSON.stringify({ Active: {} }),
    );
    localStorage.setItem(
      "@cartridge/policies/0x4fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b/0x534e5f4d41494e",
      JSON.stringify({ policies: [] }),
    );
    localStorage.setItem("@cartridge/features", JSON.stringify({}));
    localStorage.setItem(
      "@cartridge/session/0x4fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b/0x534e5f4d41494e",
      JSON.stringify({ Session: {} }),
    );
    localStorage.setItem("keepMe", "keep");

    await controller.disconnect();

    expect(localStorage.getItem("lastUsedConnector")).toBeNull();
    expect(
      localStorage.getItem(
        "@cartridge/account/0x40bda2fcd37963c0b8f951801c63a88132feb399dab0f5318245b2c59a553af/0x534e5f5345504f4c4941",
      ),
    ).toBeNull();
    expect(localStorage.getItem("@cartridge/active")).toBeNull();
    expect(
      localStorage.getItem("@cartridge/https://x.cartridge.gg/active"),
    ).toBeNull();
    expect(
      localStorage.getItem(
        "@cartridge/policies/0x4fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b/0x534e5f4d41494e",
      ),
    ).toBeNull();
    expect(localStorage.getItem("@cartridge/features")).toBeNull();
    expect(
      localStorage.getItem(
        "@cartridge/session/0x4fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b/0x534e5f4d41494e",
      ),
    ).toBeNull();
    expect(localStorage.getItem("keepMe")).toBe("keep");
    expect(localStorage.removeItem).toHaveBeenCalledWith("lastUsedConnector");
    expect(keychainDisconnect).toHaveBeenCalledTimes(1);
  });

  test("closes iframe to reset keychain state for subsequent connect", async () => {
    const controller = new ControllerProvider({});
    const keychainDisconnect = jest.fn().mockResolvedValue(undefined);
    (controller as any).keychain = {
      disconnect: keychainDisconnect,
    };

    const mockClose = jest.fn();
    (controller as any).iframes = {
      keychain: { close: mockClose },
    };

    await controller.disconnect();

    expect(keychainDisconnect).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("does not throw when localStorage is unavailable", async () => {
    delete (global as any).localStorage;
    const controller = new ControllerProvider({});
    const keychainDisconnect = jest.fn().mockResolvedValue(undefined);
    (controller as any).keychain = {
      disconnect: keychainDisconnect,
    };

    await expect(controller.disconnect()).resolves.toBeUndefined();
    expect(keychainDisconnect).toHaveBeenCalledTimes(1);
  });
});
