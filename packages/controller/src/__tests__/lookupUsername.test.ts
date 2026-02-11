import { constants } from "starknet";
import ControllerProvider from "../controller";
import { IMPLEMENTED_AUTH_OPTIONS } from "../types";

describe("lookupUsername", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns normalized signer options in canonical order", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          account: {
            username: "alice",
            controllers: {
              edges: [
                {
                  node: {
                    signers: [
                      {
                        isOriginal: true,
                        isRevoked: false,
                        metadata: {
                          __typename: "Eip191Credentials",
                          eip191: [
                            { provider: "metamask", ethAddress: "0x1" },
                            { provider: "google", ethAddress: "0x2" },
                            { provider: "unknown", ethAddress: "0x3" },
                          ],
                        },
                      },
                      {
                        isOriginal: true,
                        isRevoked: false,
                        metadata: { __typename: "PasswordCredentials" },
                      },
                      {
                        isOriginal: true,
                        isRevoked: false,
                        metadata: { __typename: "WebauthnCredentials" },
                      },
                      {
                        isOriginal: true,
                        isRevoked: true,
                        metadata: { __typename: "WebauthnCredentials" },
                      },
                      {
                        isOriginal: true,
                        isRevoked: false,
                        metadata: {
                          __typename: "Eip191Credentials",
                          eip191: [{ provider: "discord", ethAddress: "0x4" }],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      }),
    });

    const provider = new ControllerProvider({ lazyload: true });
    const result = await provider.lookupUsername("alice");
    const expectedOrder = IMPLEMENTED_AUTH_OPTIONS.filter((option) =>
      ["google", "webauthn", "discord", "password", "metamask"].includes(
        option,
      ),
    );

    expect(result).toEqual({
      username: "alice",
      exists: true,
      signers: expectedOrder,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.cartridge.gg/query",
      expect.any(Object),
    );
  });

  test("filters non-original signers on non-mainnet chains", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          account: {
            username: "alice",
            controllers: {
              edges: [
                {
                  node: {
                    signers: [
                      {
                        isOriginal: false,
                        isRevoked: false,
                        metadata: {
                          __typename: "Eip191Credentials",
                          eip191: [{ provider: "google", ethAddress: "0x1" }],
                        },
                      },
                      {
                        isOriginal: true,
                        isRevoked: false,
                        metadata: { __typename: "PasswordCredentials" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      }),
    });

    const provider = new ControllerProvider({
      lazyload: true,
      defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
    });
    const result = await provider.lookupUsername("alice");

    expect(result.signers).toEqual(["password"]);
  });

  test("returns exists=false for unknown usernames", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          account: null,
        },
      }),
    });

    const provider = new ControllerProvider({ lazyload: true });
    const result = await provider.lookupUsername("missing-user");

    expect(result).toEqual({
      username: "missing-user",
      exists: false,
      signers: [],
    });
  });

  test("throws on network failures", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
    });

    const provider = new ControllerProvider({ lazyload: true });

    await expect(provider.lookupUsername("alice")).rejects.toThrow(
      "HTTP error! status: 503",
    );
  });
});
