import ControllerProvider from "../controller";

// Mock StarknetInjectedWallet
const mockInnerDisconnect = jest.fn().mockResolvedValue(undefined);
const mockFeatures = {
  "standard:connect": { version: "1.0.0", connect: jest.fn() },
  "standard:disconnect": {
    version: "1.0.0",
    disconnect: mockInnerDisconnect,
  },
  "standard:events": { version: "1.0.0", on: jest.fn() },
  "starknet:walletApi": { version: "1.0.0", request: jest.fn() },
};

jest.mock("@starknet-io/get-starknet-wallet-standard", () => ({
  StarknetInjectedWallet: jest.fn().mockImplementation(() => ({
    version: "1.0.0",
    name: "Controller",
    icon: "data:image/svg+xml,<svg/>",
    chains: ["starknet:mainnet"],
    accounts: [],
    features: mockFeatures,
  })),
}));

describe("asWalletStandard", () => {
  let controller: ControllerProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
    console.error = jest.fn();
    controller = new ControllerProvider({});
  });

  test("should delegate properties from inner wallet", () => {
    const wallet = controller.asWalletStandard();

    expect(wallet.version).toBe("1.0.0");
    expect(wallet.name).toBe("Controller");
    expect(wallet.chains).toEqual(["starknet:mainnet"]);
    expect(wallet.accounts).toEqual([]);
  });

  test("should forward non-disconnect features from inner wallet", () => {
    const wallet = controller.asWalletStandard();

    expect(wallet.features["standard:connect"]).toBe(
      mockFeatures["standard:connect"],
    );
    expect(wallet.features["standard:events"]).toBe(
      mockFeatures["standard:events"],
    );
    expect(wallet.features["starknet:walletApi"]).toBe(
      mockFeatures["starknet:walletApi"],
    );
  });

  test("should call controller.disconnect when wallet standard disconnect is called", async () => {
    const wallet = controller.asWalletStandard();
    const controllerDisconnect = jest
      .spyOn(controller, "disconnect")
      .mockResolvedValue(undefined);

    await wallet.features["standard:disconnect"].disconnect();

    expect(mockInnerDisconnect).toHaveBeenCalled();
    expect(controllerDisconnect).toHaveBeenCalled();
  });

  test("should call inner disconnect before controller disconnect", async () => {
    const callOrder: string[] = [];

    mockInnerDisconnect.mockImplementation(async () => {
      callOrder.push("inner");
    });

    jest.spyOn(controller, "disconnect").mockImplementation(async () => {
      callOrder.push("controller");
    });

    const wallet = controller.asWalletStandard();
    await wallet.features["standard:disconnect"].disconnect();

    expect(callOrder).toEqual(["inner", "controller"]);
  });
});
