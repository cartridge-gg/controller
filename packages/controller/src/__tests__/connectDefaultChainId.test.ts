import { constants } from "starknet";
import ControllerProvider from "../controller";

// Mock the KeychainIFrame
jest.mock("../iframe/keychain", () => ({
  KeychainIFrame: jest.fn().mockImplementation(() => ({
    open: jest.fn(),
    close: jest.fn(),
  })),
}));

describe("ControllerProvider connect with defaultChainId", () => {
  let originalConsoleError: any;
  let originalConsoleWarn: any;
  let originalConsoleLog: any;

  beforeEach(() => {
    // Mock console methods to suppress expected errors/warnings
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleLog = console.log;
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  test("should use defaultChainId when connecting with Sepolia", async () => {
    const controller = new ControllerProvider({
      defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    // The controller should be initialized with Sepolia RPC
    expect(controller.rpcUrl()).toBe(
      "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
    );
  });

  test("should use defaultChainId when connecting with Mainnet", async () => {
    const controller = new ControllerProvider({
      defaultChainId: constants.StarknetChainId.SN_MAIN,
    });

    // The controller should be initialized with Mainnet RPC
    expect(controller.rpcUrl()).toBe(
      "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9",
    );
  });

  test("should prioritize custom chains over default chains based on defaultChainId", async () => {
    const customChains = [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" },
    ];

    const controller = new ControllerProvider({
      chains: customChains,
      defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    // Should use the Sepolia RPC since defaultChainId is set to Sepolia
    expect(controller.rpcUrl()).toBe(
      "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
    );
  });

  test("should use defaultChainId with custom chain configuration", async () => {
    const controller = new ControllerProvider({
      chains: [
        { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" },
        { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
      ],
      defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    // Should respect the defaultChainId and use Sepolia
    expect(controller.rpcUrl()).toBe(
      "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
    );
  });
});
