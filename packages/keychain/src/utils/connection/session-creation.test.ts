import { describe, expect, it, vi } from "vitest";
import type Controller from "@/utils/controller";
import type { ParsedSessionPolicies } from "@/hooks/session";
import type { SessionChainPolicies } from "@/hooks/connection";
import {
  canAutoCreateSession,
  createVerifiedSession,
  requiresSessionApproval,
  DEFAULT_VERIFIED_SESSION_DURATION_S,
} from "./session-creation";

describe("session-creation helpers", () => {
  describe("requiresSessionApproval", () => {
    it("returns false when no policies are provided", () => {
      expect(requiresSessionApproval(undefined)).toBe(false);
      expect(requiresSessionApproval(null)).toBe(false);
    });

    it("returns true for unverified policies", () => {
      const policies = {
        verified: false,
        contracts: {},
      } as unknown as ParsedSessionPolicies;
      expect(requiresSessionApproval(policies)).toBe(true);
    });

    it("returns true for verified policies that include approvals", () => {
      const policies = {
        verified: true,
        contracts: {
          "0x1": {
            methods: [{ entrypoint: "approve" }],
          },
        },
      } as unknown as ParsedSessionPolicies;
      expect(requiresSessionApproval(policies)).toBe(true);
    });

    it("returns false for verified policies without approvals", () => {
      const policies = {
        verified: true,
        contracts: {
          "0x1": {
            methods: [{ entrypoint: "transfer" }],
          },
        },
      } as unknown as ParsedSessionPolicies;
      expect(requiresSessionApproval(policies)).toBe(false);
    });
  });

  describe("createVerifiedSession", () => {
    it("throws when policies require approval", async () => {
      const controller = {
        createSession: vi.fn(),
      } as unknown as Controller;

      await expect(
        createVerifiedSession({
          controller,
          origin: "app",
          policies: { verified: false } as unknown as ParsedSessionPolicies,
        }),
      ).rejects.toThrow(/requires explicit approval/i);
    });

    it("creates a session with processed policies and deterministic expiry", async () => {
      const createSession = vi.fn().mockResolvedValue(undefined);
      const controller = { createSession } as unknown as Controller;

      const policies = {
        verified: true,
        contracts: {
          "0xabc": {
            methods: [
              {
                entrypoint: "transfer",
                id: "method-id",
                authorized: false,
              },
            ],
          },
        },
        messages: [{ id: "msg-id", authorized: false }],
      } as unknown as ParsedSessionPolicies;

      const nowFn = () => BigInt(1_000);
      const durationSeconds = DEFAULT_VERIFIED_SESSION_DURATION_S;

      await createVerifiedSession({
        controller,
        origin: "origin",
        policies,
        nowFn,
        durationSeconds,
      });

      expect(createSession).toHaveBeenCalledTimes(1);
      const [origin, expiresAt, processedPolicies] =
        createSession.mock.calls[0];

      expect(origin).toBe("origin");
      expect(expiresAt).toBe(BigInt(1_000) + durationSeconds);

      // UI-only fields are stripped and policies are forced authorized.
      expect(
        processedPolicies.contracts["0xabc"].methods[0].id,
      ).toBeUndefined();
      expect(processedPolicies.contracts["0xabc"].methods[0].authorized).toBe(
        true,
      );
      expect(processedPolicies.messages[0].id).toBeUndefined();
      expect(processedPolicies.messages[0].authorized).toBe(true);
    });

    it("clamps the requested duration to the play-time cap", async () => {
      const createSession = vi.fn().mockResolvedValue(undefined);
      const controller = { createSession } as unknown as Controller;

      const policies = {
        verified: true,
        contracts: { "0xabc": { methods: [{ entrypoint: "transfer" }] } },
      } as unknown as ParsedSessionPolicies;

      const nowFn = () => BigInt(1_000);
      const cap = BigInt(60 * 60); // 1h cap

      await createVerifiedSession({
        controller,
        origin: "origin",
        policies,
        nowFn,
        durationSeconds: BigInt(7 * 24 * 60 * 60), // requested 7d
        maxDurationSeconds: cap,
      });

      const [, expiresAt] = createSession.mock.calls[0];
      // Expiry uses the clamped 1h cap, not the requested 7d.
      expect(expiresAt).toBe(BigInt(1_000) + cap);
    });

    it("leaves duration unchanged when the cap is null", async () => {
      const createSession = vi.fn().mockResolvedValue(undefined);
      const controller = { createSession } as unknown as Controller;

      const policies = {
        verified: true,
        contracts: { "0xabc": { methods: [{ entrypoint: "transfer" }] } },
      } as unknown as ParsedSessionPolicies;

      const nowFn = () => BigInt(1_000);
      const duration = BigInt(2 * 60 * 60);

      await createVerifiedSession({
        controller,
        origin: "origin",
        policies,
        nowFn,
        durationSeconds: duration,
        maxDurationSeconds: null,
      });

      const [, expiresAt] = createSession.mock.calls[0];
      expect(expiresAt).toBe(BigInt(1_000) + duration);
    });
  });

  describe("multichain sessions", () => {
    const verifiedPolicies = {
      verified: true,
      contracts: {
        "0x1": { methods: [{ entrypoint: "transfer" }] },
      },
    } as unknown as ParsedSessionPolicies;

    const unverifiedPolicies = {
      verified: false,
      contracts: {
        "0x1": { methods: [{ entrypoint: "transfer" }] },
      },
    } as unknown as ParsedSessionPolicies;

    const chains = (
      policiesByChain: Record<string, ParsedSessionPolicies>,
    ): SessionChainPolicies =>
      Object.entries(policiesByChain).map(([chainId, policies]) => ({
        chainId,
        rpcUrl: `https://${chainId}.example/rpc`,
        policies,
      }));

    it("requires approval when any chain requires it", () => {
      expect(
        requiresSessionApproval(
          undefined,
          chains({ "0x1": verifiedPolicies, "0x2": unverifiedPolicies }),
        ),
      ).toBe(true);
      expect(
        requiresSessionApproval(
          undefined,
          chains({ "0x1": verifiedPolicies, "0x2": verifiedPolicies }),
        ),
      ).toBe(false);
    });

    it("gates auto-creation on the whole chain set", () => {
      expect(
        canAutoCreateSession(
          verifiedPolicies,
          chains({ "0x1": verifiedPolicies, "0x2": unverifiedPolicies }),
        ),
      ).toBe(false);
      expect(
        canAutoCreateSession(
          verifiedPolicies,
          chains({ "0x1": verifiedPolicies, "0x2": verifiedPolicies }),
        ),
      ).toBe(true);
    });

    it("creates one session per chain through createMultichainSession", async () => {
      const createMultichainSession = vi
        .fn()
        .mockResolvedValue([{ chainId: "0x1" }, { chainId: "0x2" }]);
      const createSession = vi.fn();
      const controller = {
        createSession,
        createMultichainSession,
      } as unknown as Controller;

      const chainPolicies = chains({
        "0x1": verifiedPolicies,
        "0x2": verifiedPolicies,
      });

      const nowFn = () => BigInt(1_000);
      await createVerifiedSession({
        controller,
        origin: "origin",
        policies: verifiedPolicies,
        chainPolicies,
        nowFn,
      });

      expect(createSession).not.toHaveBeenCalled();
      expect(createMultichainSession).toHaveBeenCalledTimes(1);
      const [origin, expiresAt, inputs] = createMultichainSession.mock.calls[0];
      expect(origin).toBe("origin");
      expect(expiresAt).toBe(
        BigInt(1_000) + DEFAULT_VERIFIED_SESSION_DURATION_S,
      );
      expect(inputs).toHaveLength(2);
      expect(inputs[0].chainId).toBe("0x1");
      expect(inputs[0].rpcUrl).toBe("https://0x1.example/rpc");
      expect(inputs[0].policies.contracts["0x1"].methods[0].authorized).toBe(
        true,
      );
    });

    it("throws when a chain fails to create", async () => {
      const createMultichainSession = vi
        .fn()
        .mockResolvedValue([
          { chainId: "0x1" },
          { chainId: "0x2", error: new Error("user cancelled") },
        ]);
      const controller = {
        createMultichainSession,
      } as unknown as Controller;

      await expect(
        createVerifiedSession({
          controller,
          origin: "origin",
          policies: verifiedPolicies,
          chainPolicies: chains({
            "0x1": verifiedPolicies,
            "0x2": verifiedPolicies,
          }),
        }),
      ).rejects.toThrow("user cancelled");
    });

    it("throws when any chain requires approval", async () => {
      const controller = {
        createMultichainSession: vi.fn(),
      } as unknown as Controller;

      await expect(
        createVerifiedSession({
          controller,
          origin: "origin",
          policies: verifiedPolicies,
          chainPolicies: chains({
            "0x1": verifiedPolicies,
            "0x2": unverifiedPolicies,
          }),
        }),
      ).rejects.toThrow(/requires explicit approval/i);
    });
  });
});
