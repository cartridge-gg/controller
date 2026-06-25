/**
 * Resolve the Torii base URL — the single source of truth for how a Torii URL
 * is built across the keychain.
 *
 * A caller-provided `toriiUrl` (SDK `toriiUrl` option) takes precedence over the
 * default Slot URL derived from `project` (SDK `slot` option). Trailing slashes
 * are stripped so callers can safely append paths like `/static/...`.
 *
 * @param project - The Slot project name (from the `ps` URL param).
 * @param toriiUrl - An explicit Torii URL override (from the `torii` URL param).
 * @returns The resolved Torii base URL, or `null` when neither is available.
 */
export function getToriiUrl(
  project?: string | null,
  toriiUrl?: string | null,
): string | null {
  if (toriiUrl) return toriiUrl.replace(/\/+$/, "");
  if (project) return `https://api.cartridge.gg/x/${project}/torii`;
  return null;
}
