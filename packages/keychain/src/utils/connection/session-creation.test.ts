import { describe, expect, it, vi } from "vitest";
import type Controller from "@/utils/controller";
import type { ParsedSessionPolicies } from "@/hooks/session";
import {
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
  });
});
