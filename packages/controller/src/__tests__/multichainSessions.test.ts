import { constants, shortString } from "starknet";
import ControllerProvider from "../controller";
import { KeychainIFrame } from "../iframe/keychain";
import { getPresetSessionPoliciesForChains } from "../utils";

// Mock the KeychainIFrame to capture constructor options
jest.mock("../iframe/keychain", () => ({
  KeychainIFrame: jest.fn().mockImplementation(() => ({
    open: jest.fn(),
    close: jest.fn(),
  })),
}));

const APPCHAIN_RPC = "https://api.cartridge.gg/x/gbomb/katana";
const APPCHAIN_CHAIN_ID = shortString.encodeShortString("WP_GBOMB");

const policies = {
  contracts: {
    "0x1": { methods: [{ entrypoint: "play" }] },
  },
};

describe("ControllerProvider multichainSessions option", () => {
  let originalConsoleError: unknown;
  let originalConsoleWarn: unknown;

  beforeEach(() => {
    jest.clearAllMocks();
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError as typeof console.error;
    console.warn = originalConsoleWarn as typeof console.warn;
  });

  test("passes resolved session chains to the keychain iframe", () => {
    new ControllerProvider({
      defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
      chains: [{ rpcUrl: APPCHAIN_RPC }],
      policies,
      multichainSessions: [
        constants.StarknetChainId.SN_SEPOLIA,
        APPCHAIN_CHAIN_ID,
      ],
    });

    const options = (KeychainIFrame as unknown as jest.Mock).mock.calls[0][0];
    expect(options.sessionChains).toEqual([
      {
        chainId: constants.StarknetChainId.SN_SEPOLIA,
        rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
      },
      {
        chainId: APPCHAIN_CHAIN_ID,
        rpcUrl: APPCHAIN_RPC,
      },
    ]);
  });

  test("omits sessionChains when the option is absent", () => {
    new ControllerProvider({
      defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
      policies,
    });

    const options = (KeychainIFrame as unknown as jest.Mock).mock.calls[0][0];
    expect(options.sessionChains).toBeUndefined();
  });

  test("throws when a session chain is not configured", () => {
    expect(
      () =>
        new ControllerProvider({
          defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
          policies,
          multichainSessions: [APPCHAIN_CHAIN_ID],
        }),
    ).toThrow(/not a configured chain/);
  });

  test("throws when neither policies nor preset is provided", () => {
    expect(
      () =>
        new ControllerProvider({
          defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
          multichainSessions: [constants.StarknetChainId.SN_SEPOLIA],
        }),
    ).toThrow(/requires `policies` or `preset`/);
  });

  test("accepts a preset instead of policies", () => {
    expect(
      () =>
        new ControllerProvider({
          defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
          preset: "glitch-bomb",
          multichainSessions: [constants.StarknetChainId.SN_SEPOLIA],
        }),
    ).not.toThrow();
  });
});

describe("getPresetSessionPoliciesForChains", () => {
  const config = {
    chains: {
      SN_SEPOLIA: { policies },
      WP_GBOMB: { policies },
    },
  };

  test("resolves policies for every requested chain", () => {
    const result = getPresetSessionPoliciesForChains(config, [
      constants.StarknetChainId.SN_SEPOLIA,
      APPCHAIN_CHAIN_ID,
    ]);

    expect(result.size).toBe(2);
    expect(
      result.get(constants.StarknetChainId.SN_SEPOLIA)?.contracts,
    ).toBeDefined();
    expect(result.get(APPCHAIN_CHAIN_ID)?.contracts).toBeDefined();
  });

  test("throws when a chain is missing from the preset", () => {
    expect(() =>
      getPresetSessionPoliciesForChains(config, [
        constants.StarknetChainId.SN_MAIN,
      ]),
    ).toThrow(/No policies found for chain SN_MAIN/);
  });
});
