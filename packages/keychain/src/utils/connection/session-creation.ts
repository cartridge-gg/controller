import type Controller from "@/utils/controller";
import { now } from "@/constants";
import {
  hasApprovalPolicies,
  type ParsedSessionPolicies,
} from "@/hooks/session";
import { processPolicies } from "@/utils/session/policies";

export const DEFAULT_VERIFIED_SESSION_DURATION_S = BigInt(24 * 60 * 60);

export function requiresSessionApproval(
  policies?: ParsedSessionPolicies | null,
): boolean {
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
): boolean {
  return !policies || !requiresSessionApproval(policies);
}

export async function createVerifiedSession({
  controller,
  origin,
  policies,
  durationSeconds = DEFAULT_VERIFIED_SESSION_DURATION_S,
  nowFn = now,
}: {
  controller: Controller;
  origin: string;
  policies: ParsedSessionPolicies;
  durationSeconds?: bigint;
  nowFn?: () => bigint;
}): Promise<void> {
  if (requiresSessionApproval(policies)) {
    throw new Error("Verified session creation requires explicit approval");
  }

  const expiresAt = durationSeconds + nowFn();
  const processedPolicies = processPolicies(policies, false);
  await controller.createSession(origin, expiresAt, processedPolicies);
}
