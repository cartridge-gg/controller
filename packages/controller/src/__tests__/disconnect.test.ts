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
    localStorage.setItem("session", JSON.stringify({ id: "0xabc" }));
    localStorage.setItem("sessionSigner", JSON.stringify({ privKey: "0x1" }));
    localStorage.setItem("sessionPolicies", JSON.stringify({}));
    localStorage.setItem("keepMe", "keep");

    await controller.disconnect();

    expect(localStorage.getItem("lastUsedConnector")).toBeNull();
    expect(localStorage.getItem("session")).toBeNull();
    expect(localStorage.getItem("sessionSigner")).toBeNull();
    expect(localStorage.getItem("sessionPolicies")).toBeNull();
    expect(localStorage.getItem("keepMe")).toBe("keep");
    expect(localStorage.removeItem).toHaveBeenCalledWith("lastUsedConnector");
    expect(keychainDisconnect).toHaveBeenCalledTimes(1);
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
