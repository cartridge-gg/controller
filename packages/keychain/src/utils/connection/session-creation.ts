import type Controller from "@/utils/controller";
import { now } from "@/constants";
import {
  hasApprovalPolicies,
  type ParsedSessionPolicies,
} from "@/hooks/session";
import type { SessionChainPolicies } from "@/hooks/connection";
import { processPolicies } from "@/utils/session/policies";

export const DEFAULT_VERIFIED_SESSION_DURATION_S = BigInt(24 * 60 * 60);

export function requiresSessionApproval(
  policies?: ParsedSessionPolicies | null,
  chainPolicies?: SessionChainPolicies | null,
): boolean {
  // Multichain approvals: any chain needing review sends the whole set to the
  // approval UI so the user consents to every chain at once.
  if (chainPolicies && chainPolicies.length > 0) {
    return chainPolicies.some((chain) =>
      requiresSessionApproval(chain.policies),
    );
  }

  if (!policies) {
    return false;
  }

  // Unverified policies always require explicit user consent.
  if (!policies.verified) {
    return true;
  }

  // Even when policies are verified, token approvals should always require UI review.
  return hasApprovalPolicies(policies);
}

export function canAutoCreateSession(
  policies?: ParsedSessionPolicies | null,
  chainPolicies?: SessionChainPolicies | null,
): boolean {
  if (chainPolicies && chainPolicies.length > 0) {
    return !requiresSessionApproval(undefined, chainPolicies);
  }
  return !policies || !requiresSessionApproval(policies);
}

export async function createVerifiedSession({
  controller,
  origin,
  policies,
  chainPolicies,
  durationSeconds = DEFAULT_VERIFIED_SESSION_DURATION_S,
  nowFn = now,
}: {
  controller: Controller;
  origin: string;
  policies: ParsedSessionPolicies;
  /** When set, creates one session per chain (multichain opt-in). */
  chainPolicies?: SessionChainPolicies;
  durationSeconds?: bigint;
  nowFn?: () => bigint;
}): Promise<void> {
  if (requiresSessionApproval(policies, chainPolicies)) {
    throw new Error("Verified session creation requires explicit approval");
  }

  const expiresAt = durationSeconds + nowFn();

  if (chainPolicies && chainPolicies.length > 0) {
    const results = await controller.createMultichainSession(
      origin,
      expiresAt,
      chainPolicies.map((chain) => ({
        chainId: chain.chainId,
        rpcUrl: chain.rpcUrl,
        policies: processPolicies(chain.policies, false),
      })),
    );
    const failed = results.find((r) => r.error);
    if (failed) {
      throw failed.error;
    }
    return;
  }

  const processedPolicies = processPolicies(policies, false);
  await controller.createSession(origin, expiresAt, processedPolicies);
}
