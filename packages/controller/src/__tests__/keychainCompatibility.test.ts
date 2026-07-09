const mockExternalDetectWallets = jest.fn();
const mockExternalConnectWallet = jest.fn();
const mockExternalSignMessage = jest.fn();
const mockExternalSignTypedData = jest.fn();
const mockExternalSendTransaction = jest.fn();
const mockExternalGetBalance = jest.fn();
const mockExternalSwitchChain = jest.fn();
const mockExternalWaitForTransaction = jest.fn();

// Capture the reverse (keychain -> SDK) method table where KeychainIFrame
// hands it to the real IFrame/Penpal boundary. Wallet implementations are
// deterministic spies; KeychainIFrame's URL and wrapper construction are real.
const mockBridgeMethods = {
  externalDetectWallets: (_origin: string) => mockExternalDetectWallets,
  externalConnectWallet: (_origin: string) => mockExternalConnectWallet,
  externalSignMessage: (_origin: string) => mockExternalSignMessage,
  externalSignTypedData: (_origin: string) => mockExternalSignTypedData,
  externalSendTransaction: (_origin: string) => mockExternalSendTransaction,
  externalGetBalance: (_origin: string) => mockExternalGetBalance,
  externalSwitchChain: (_origin: string) => mockExternalSwitchChain,
  externalWaitForTransaction: (_origin: string) =>
    mockExternalWaitForTransaction,
};

let mockIFrameOptions: {
  url: URL;
  methods: Record<string, (origin: string) => (...args: any[]) => unknown>;
};

jest.mock("../iframe/base", () => ({
  IFrame: class {
    constructor(options: typeof mockIFrameOptions) {
      mockIFrameOptions = options;
    }

    close() {}
  },
}));

jest.mock("../wallets/bridge", () => ({
  WalletBridge: jest.fn().mockImplementation(() => ({
    getIFrameMethods: () => mockBridgeMethods,
  })),
}));

import { KeychainIFrame } from "../iframe/keychain";

const createKeychain = (overrides: Record<string, unknown> = {}) =>
  new KeychainIFrame({
    url: "https://x.cartridge.gg",
    onConnect: jest.fn(),
    ...overrides,
  });

describe("hosted keychain compatibility contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps the SDK version gate and sends both Torii generations additively", () => {
    createKeychain({
      version: "0.13.13",
      slot: "legacy-game",
      toriiUrl: "https://torii.example.com/custom/",
    });

    expect(
      decodeURIComponent(mockIFrameOptions.url.searchParams.get("v")!),
    ).toBe("0.13.13");
    expect(
      decodeURIComponent(mockIFrameOptions.url.searchParams.get("ps")!),
    ).toBe("legacy-game");
    expect(
      decodeURIComponent(mockIFrameOptions.url.searchParams.get("torii")!),
    ).toBe("https://torii.example.com/custom/");
  });

  it("leaves the 0.13.12 Slot-only query contract unchanged", () => {
    createKeychain({ version: "0.13.12", slot: "legacy-game" });

    expect(
      decodeURIComponent(mockIFrameOptions.url.searchParams.get("v")!),
    ).toBe("0.13.12");
    expect(
      decodeURIComponent(mockIFrameOptions.url.searchParams.get("ps")!),
    ).toBe("legacy-game");
    expect(mockIFrameOptions.url.searchParams.has("torii")).toBe(false);
  });

  it.each(["0.13.12", "0.13.13", "0.14.0-alpha.1"])(
    "keeps the same hosted bridge surface for Controller %s",
    (version) => {
      createKeychain({ version });

      expect(
        decodeURIComponent(mockIFrameOptions.url.searchParams.get("v")!),
      ).toBe(version);
      expect(Object.keys(mockIFrameOptions.methods)).toEqual(
        expect.arrayContaining([
          ...Object.keys(mockBridgeMethods),
          "onSessionCreated",
          "onStarterpackPlay",
        ]),
      );
    },
  );

  it("exposes the established external-wallet bridge names and positions", async () => {
    createKeychain();

    const externalMethods = Object.keys(mockIFrameOptions.methods)
      .filter((name) => name.startsWith("external"))
      .sort();
    expect(externalMethods).toEqual(
      expect.arrayContaining([
        "externalConnectWallet",
        "externalDetectWallets",
        "externalGetBalance",
        "externalSendTransaction",
        "externalSignMessage",
        "externalSignTypedData",
        "externalSwitchChain",
        "externalWaitForTransaction",
      ]),
    );

    mockExternalDetectWallets.mockResolvedValue([
      { type: "metamask", available: true },
    ]);
    mockExternalConnectWallet.mockResolvedValue({
      success: true,
      wallet: "metamask",
      account: "0xabc",
    });
    mockExternalSignMessage.mockResolvedValue({
      success: true,
      wallet: "metamask",
      result: "0xsig",
    });
    mockExternalSignTypedData.mockResolvedValue({
      success: true,
      wallet: "metamask",
      result: "0xtyped",
    });
    mockExternalSendTransaction.mockResolvedValue({
      success: true,
      wallet: "metamask",
      result: "0xtx",
    });
    mockExternalGetBalance.mockResolvedValue({
      success: true,
      wallet: "metamask",
      result: "0x10",
    });
    mockExternalSwitchChain.mockResolvedValue(true);
    mockExternalWaitForTransaction.mockResolvedValue({
      success: true,
      wallet: "metamask",
      result: { status: "confirmed" },
    });

    const methods = mockIFrameOptions.methods;
    const results = [
      await methods.externalDetectWallets("https://game.example")(),
      await methods.externalConnectWallet("https://game.example")("metamask"),
      await methods.externalSignMessage("https://game.example")(
        "metamask",
        "hello",
      ),
      await methods.externalSignTypedData("https://game.example")("metamask", {
        domain: { name: "game" },
      }),
      await methods.externalSendTransaction("https://game.example")(
        "metamask",
        { to: "0x123" },
      ),
      await methods.externalGetBalance("https://game.example")(
        "metamask",
        "0xtoken",
      ),
      await methods.externalSwitchChain("https://game.example")(
        "metamask",
        "0x1",
      ),
      await methods.externalWaitForTransaction("https://game.example")(
        "metamask",
        "0xtx",
        30_000,
      ),
    ];

    expect(mockExternalDetectWallets).toHaveBeenCalledWith();
    expect(mockExternalConnectWallet).toHaveBeenCalledWith("metamask");
    expect(mockExternalSignMessage).toHaveBeenCalledWith("metamask", "hello");
    expect(mockExternalSignTypedData).toHaveBeenCalledWith("metamask", {
      domain: { name: "game" },
    });
    expect(mockExternalSendTransaction).toHaveBeenCalledWith("metamask", {
      to: "0x123",
    });
    expect(mockExternalGetBalance).toHaveBeenCalledWith("metamask", "0xtoken");
    expect(mockExternalSwitchChain).toHaveBeenCalledWith("metamask", "0x1");
    expect(mockExternalWaitForTransaction).toHaveBeenCalledWith(
      "metamask",
      "0xtx",
      30_000,
    );
    expect(results).toEqual([
      [{ type: "metamask", available: true }],
      { success: true, wallet: "metamask", account: "0xabc" },
      { success: true, wallet: "metamask", result: "0xsig" },
      { success: true, wallet: "metamask", result: "0xtyped" },
      { success: true, wallet: "metamask", result: "0xtx" },
      { success: true, wallet: "metamask", result: "0x10" },
      true,
      {
        success: true,
        wallet: "metamask",
        result: { status: "confirmed" },
      },
    ]);
    expect(JSON.parse(JSON.stringify(results))).toEqual(results);
  });
});
