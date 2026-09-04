import { LOGOUT_QUERY_NAME } from "../constants";

// SessionProvider transitively pulls in ESM-only wasm/wallet packages that
// ts-jest does not transform. Mock their value exports; the logout path under
// test touches none of them.
jest.mock("@cartridge/controller-wasm", () => ({
  signerToGuid: () => "0xsessionkeyguid",
  subscribeCreateSession: jest.fn(),
}));
jest.mock("@cartridge/controller-wasm/session", () => ({
  CartridgeSessionAccount: class {},
}));
jest.mock("@starknet-io/get-starknet-core", () => ({
  StarknetInjectedWallet: class {},
}));
jest.mock("@wallet-standard/wallet", () => ({
  registerWallet: jest.fn(),
}));
jest.mock("@cartridge/presets", () => ({
  loadConfig: jest.fn(),
}));

import SessionProvider from "../session/provider";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9";
const CHAIN_ID = "0x534e5f5345504f4c4941";

const policies = {
  contracts: {
    "0x1": { methods: [{ name: "transfer", entrypoint: "transfer" }] },
  },
};

const createMockLocalStorage = (): Storage => {
  const store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage;
};

// Minimal window with a mutable search + history.replaceState that keeps the
// two in sync, mirroring how the browser exposes the redirect URL.
function installMockWindow(search = "") {
  const open = jest.fn(() => null);
  const win = {
    location: { pathname: "/", search, hash: "" },
    history: {
      replaceState: (_state: unknown, _title: string, url: string) => {
        const [pathname, rest] = url.split("?");
        win.location.pathname = pathname || "/";
        win.location.search = rest ? `?${rest.split("#")[0]}` : "";
      },
    },
    open,
  };
  (global as unknown as { window?: unknown }).window = win;
  return { win, open };
}

function newProvider() {
  return new SessionProvider({
    rpc: RPC_URL,
    chainId: CHAIN_ID,
    policies,
    redirectUrl: "cartridge-session://session",
    keychainUrl: "https://x.cartridge.gg",
  });
}

function seedSession(provider: SessionProvider) {
  localStorage.setItem("session", JSON.stringify({ username: "player" }));
  localStorage.setItem(
    "sessionSigner",
    JSON.stringify({ privKey: "0x1", pubKey: "0x2" }),
  );
  localStorage.setItem("sessionPolicies", JSON.stringify(policies));
  localStorage.setItem("lastUsedConnector", "controller_session");
  (provider as unknown as { _username?: string })._username = "player";
  (provider as unknown as { account?: unknown }).account = { address: "0xabc" };
}

function isCleared(provider: SessionProvider): boolean {
  return (
    localStorage.getItem("session") === null &&
    localStorage.getItem("sessionSigner") === null &&
    localStorage.getItem("sessionPolicies") === null &&
    localStorage.getItem("lastUsedConnector") === null &&
    (provider as unknown as { account?: unknown }).account === undefined &&
    (provider as unknown as { _username?: string })._username === undefined
  );
}

describe("SessionProvider logout signal", () => {
  const originalWindow = (global as unknown as { window?: unknown }).window;
  const originalDocument = (global as unknown as { document?: unknown })
    .document;
  const originalLocalStorage = (global as unknown as { localStorage?: unknown })
    .localStorage;

  beforeEach(() => {
    (global as unknown as { localStorage: Storage }).localStorage =
      createMockLocalStorage();
    (global as unknown as { document: { title: string } }).document = {
      title: "Controller",
    };
    delete (global as unknown as { window?: unknown }).window;
  });

  afterEach(() => {
    (global as unknown as { window?: unknown }).window = originalWindow;
    (global as unknown as { document?: unknown }).document = originalDocument;
    (global as unknown as { localStorage?: unknown }).localStorage =
      originalLocalStorage;
    jest.restoreAllMocks();
  });

  it("clears the local session when a deep-link carries the logout signal", () => {
    const provider = newProvider();
    seedSession(provider);

    const consumed = provider.ingestLogoutFromRedirect(
      `cartridge-session://session?${LOGOUT_QUERY_NAME}=1`,
    );

    expect(consumed).toBe(true);
    expect(isCleared(provider)).toBe(true);
  });

  it("leaves the session intact when the deep-link has no logout signal", () => {
    const provider = newProvider();
    seedSession(provider);

    const consumed = provider.ingestLogoutFromRedirect(
      "cartridge-session://session?startapp=abc",
    );

    expect(consumed).toBe(false);
    expect(localStorage.getItem("session")).not.toBeNull();
    expect((provider as unknown as { account?: unknown }).account).toEqual({
      address: "0xabc",
    });
  });

  it("consumes the logout signal from the web redirect URL on probe and strips it", async () => {
    const { win, open } = installMockWindow(`?${LOGOUT_QUERY_NAME}=1&foo=bar`);

    // A full-page redirect back to the app constructs a fresh provider: the
    // in-memory account is undefined but localStorage still holds the session.
    const provider = newProvider();
    seedSession(provider);
    (provider as unknown as { account?: unknown }).account = undefined;
    (provider as unknown as { _username?: string })._username = undefined;

    const account = await provider.probe();

    expect(account).toBeUndefined();
    expect(isCleared(provider)).toBe(true);
    // The signal is consumed once and removed; unrelated params are preserved.
    expect(win.location.search).toBe("?foo=bar");
    // Consuming the signal must NOT reopen the keychain /disconnect tab.
    expect(open).not.toHaveBeenCalled();
  });

  it("does not reopen /disconnect while consuming the logout signal", () => {
    const { open } = installMockWindow();
    const provider = newProvider();
    seedSession(provider);

    provider.ingestLogoutFromRedirect(
      `cartridge-session://session?${LOGOUT_QUERY_NAME}=1`,
    );

    expect(open).not.toHaveBeenCalled();
  });
});
