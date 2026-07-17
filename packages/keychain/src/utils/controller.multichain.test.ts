import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ParsedSessionPolicies } from "@/hooks/session";

const { cartridgeAccountNew } = vi.hoisted(() => ({
  cartridgeAccountNew: vi.fn(),
}));

vi.mock("@cartridge/controller-wasm/controller", () => ({
  CartridgeAccount: { new: cartridgeAccountNew },
  CartridgeAccountMeta: vi.fn(),
  ControllerFactory: {},
  ErrorCode: { SessionAlreadyRegistered: 132 },
}));

import Controller from "./controller";

const SEPOLIA = "0x534e5f5345504f4c4941";
const APPCHAIN = "0x4341525452494447455f544553544e4554";

const policies = {
  verified: true,
  contracts: {
    "0x1": { methods: [{ entrypoint: "transfer", authorized: true }] },
  },
} as unknown as ParsedSessionPolicies;

function buildController({
  activeChainId = SEPOLIA,
  createSession = vi.fn().mockResolvedValue({ chainId: activeChainId }),
}: {
  activeChainId?: string;
  createSession?: ReturnType<typeof vi.fn>;
} = {}) {
  const controller = Object.create(Controller.prototype) as Controller;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (controller as any).cartridge = { createSession };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (controller as any).cartridgeMeta = {
    chainId: () => activeChainId,
    rpcUrl: () => "https://active.example/rpc",
    classHash: () => "0xclass",
    address: () => "0xaddress",
    username: () => "user",
    owner: () => ({}),
  };
  return { controller, createSession };
}

function mockEphemeralAccount(
  createSession: ReturnType<typeof vi.fn>,
  registerSession: ReturnType<typeof vi.fn> = vi.fn(),
) {
  const free = vi.fn();
  cartridgeAccountNew.mockResolvedValue({
    intoAccount: () => ({ createSession, registerSession, free }),
    meta: () => ({}),
  });
  return { free };
}

describe("Controller.createMultichainSession", () => {
  beforeEach(() => {
    cartridgeAccountNew.mockReset();
  });

  it("creates the active chain session first, then the others", async () => {
    const order: string[] = [];
    const activeCreateSession = vi.fn().mockImplementation(async () => {
      order.push("active");
      return {};
    });
    const ephemeralCreateSession = vi.fn().mockImplementation(async () => {
      order.push("ephemeral");
      return {};
    });
    const { free } = mockEphemeralAccount(ephemeralCreateSession);
    const { controller } = buildController({
      createSession: activeCreateSession,
    });

    const results = await controller.createMultichainSession(
      "app",
      BigInt(2_000),
      [
        // Deliberately listed appchain-first: the active chain must still
        // sign first.
        { chainId: APPCHAIN, rpcUrl: "https://appchain.example/rpc", policies },
        { chainId: SEPOLIA, rpcUrl: "https://sepolia.example/rpc", policies },
      ],
    );

    expect(order).toEqual(["active", "ephemeral"]);
    expect(results).toHaveLength(2);
    expect(results.every((r) => !r.error)).toBe(true);
    expect(results[0].chainId).toBe(SEPOLIA);
    expect(results[1].chainId).toBe(APPCHAIN);
    // Ephemeral accounts are freed, and the active chain's account state is
    // re-materialized after touching other chains (appchain + restore).
    expect(cartridgeAccountNew).toHaveBeenCalledTimes(2);
    expect(cartridgeAccountNew.mock.calls[1][1]).toBe(
      "https://active.example/rpc",
    );
    expect(free).toHaveBeenCalled();
  });

  it("collects per-chain failures without aborting the loop", async () => {
    const activeCreateSession = vi.fn().mockResolvedValue({});
    const ephemeralCreateSession = vi
      .fn()
      .mockRejectedValue(new Error("user cancelled"));
    mockEphemeralAccount(ephemeralCreateSession);
    const { controller } = buildController({
      createSession: activeCreateSession,
    });

    const results = await controller.createMultichainSession(
      "app",
      BigInt(2_000),
      [
        { chainId: SEPOLIA, rpcUrl: "https://sepolia.example/rpc", policies },
        { chainId: APPCHAIN, rpcUrl: "https://appchain.example/rpc", policies },
      ],
    );

    expect(results).toHaveLength(2);
    expect(results[0].error).toBeUndefined();
    expect(results[1].chainId).toBe(APPCHAIN);
    expect(results[1].error?.message).toBe("user cancelled");
  });

  it("reports signing progress per chain", async () => {
    const progress: Array<[string, number, number]> = [];
    mockEphemeralAccount(vi.fn().mockResolvedValue({}));
    const { controller } = buildController();

    await controller.createMultichainSession(
      "app",
      BigInt(2_000),
      [
        { chainId: SEPOLIA, rpcUrl: "https://sepolia.example/rpc", policies },
        { chainId: APPCHAIN, rpcUrl: "https://appchain.example/rpc", policies },
      ],
      (chainId, index, total) => progress.push([chainId, index, total]),
    );

    expect(progress).toEqual([
      [SEPOLIA, 0, 2],
      [APPCHAIN, 1, 2],
    ]);
  });

  it("does not touch ephemeral accounts for a single active-chain entry", async () => {
    const { controller, createSession } = buildController();

    const results = await controller.createMultichainSession(
      "app",
      BigInt(2_000),
      [{ chainId: SEPOLIA, rpcUrl: "https://sepolia.example/rpc", policies }],
    );

    expect(createSession).toHaveBeenCalledTimes(1);
    expect(cartridgeAccountNew).not.toHaveBeenCalled();
    expect(results[0].error).toBeUndefined();
  });
});

describe("Controller.registerSessionOnChains", () => {
  beforeEach(() => {
    cartridgeAccountNew.mockReset();
  });

  it("registers on every chain and treats already-registered as success", async () => {
    const registerSession = vi
      .fn()
      .mockResolvedValueOnce({ transaction_hash: "0xtx1" })
      .mockRejectedValueOnce({ code: 132, message: "already registered" });
    mockEphemeralAccount(vi.fn(), registerSession);
    const { controller } = buildController();

    const results = await controller.registerSessionOnChains(
      "app",
      BigInt(2_000),
      [
        { chainId: APPCHAIN, rpcUrl: "https://appchain.example/rpc", policies },
        { chainId: "0x777", rpcUrl: "https://other.example/rpc", policies },
      ],
      "0xpubkey",
    );

    expect(results).toHaveLength(2);
    expect(results[0].transactionHash).toBe("0xtx1");
    expect(results[0].error).toBeUndefined();
    expect(results[1].error).toBeUndefined();
  });

  it("collects registration failures per chain", async () => {
    const registerSession = vi
      .fn()
      .mockRejectedValue(new Error("insufficient funds"));
    mockEphemeralAccount(vi.fn(), registerSession);
    const { controller } = buildController();

    const results = await controller.registerSessionOnChains(
      "app",
      BigInt(2_000),
      [{ chainId: APPCHAIN, rpcUrl: "https://appchain.example/rpc", policies }],
      "0xpubkey",
    );

    expect(results[0].error?.message).toBe("insufficient funds");
  });
});
