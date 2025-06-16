import { constants } from "starknet";
import ControllerProvider from "../controller";

describe("ControllerProvider defaults", () => {
  let originalConsoleError: any;
  let originalConsoleWarn: any;

  beforeEach(() => {
    // Mock console methods to suppress expected errors/warnings
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  test("should use default chains and chainId when not provided", () => {
    const controller = new ControllerProvider({});

    expect(controller.rpcUrl()).toBe(
      "https://api.cartridge.gg/x/starknet/mainnet",
    );
  });

  test("should use custom chains when provided", () => {
    const customChains = [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" },
    ];

    const controller = new ControllerProvider({
      chains: customChains,
      defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    expect(controller.rpcUrl()).toBe(
      "https://api.cartridge.gg/x/starknet/sepolia",
    );
  });

  test("should throw error when using non-Cartridge RPC for mainnet", async () => {
    const invalidChains = [
      { rpcUrl: "https://some-other-provider.com/starknet/mainnet" },
    ];

    expect(() => {
      new ControllerProvider({
        chains: invalidChains,
        defaultChainId: constants.StarknetChainId.SN_MAIN,
      });
    }).toThrow("Only Cartridge RPC providers are allowed for mainnet");
  });

  test("should throw error when using non-Cartridge RPC for sepolia", async () => {
    const invalidChains = [
      { rpcUrl: "https://some-other-provider.com/starknet/sepolia" },
    ];

    expect(() => {
      new ControllerProvider({
        chains: invalidChains,
        defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
      });
    }).toThrow("Only Cartridge RPC providers are allowed for sepolia");
  });

  test("should allow non-Cartridge RPC for custom chains", () => {
    const customChains = [{ rpcUrl: "http://localhost:5050" }];

    // This should not throw
    expect(() => {
      new ControllerProvider({
        chains: customChains,
      });
    }).not.toThrow();
  });
});
