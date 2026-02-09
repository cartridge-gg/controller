import type { ParsedSessionPolicies } from "@/hooks/session";

/**
 * Deep copy the policies and remove UI-only fields.
 *
 * IMPORTANT:
 * - This intentionally strips `id` fields (used only for UI rendering).
 * - When `toggleOff` is provided, it forces all policies to authorized/unauthorized
 *   to support "Skip" flows.
 */
export function processPolicies(
  policies: ParsedSessionPolicies,
  toggleOff?: boolean,
): ParsedSessionPolicies {
  const processed: ParsedSessionPolicies = JSON.parse(JSON.stringify(policies));

  if (processed.contracts) {
    Object.values(processed.contracts).forEach((contract) => {
      contract.methods.forEach((method) => {
        delete method.id;
        if (toggleOff !== undefined) {
          method.authorized = !toggleOff;
        }
      });
    });
  }

  if (processed.messages) {
    processed.messages.forEach((message) => {
      delete message.id;
      if (toggleOff !== undefined) {
        message.authorized = !toggleOff;
      }
    });
  }

  return processed;
}
