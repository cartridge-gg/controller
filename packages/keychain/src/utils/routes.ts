// Route constants
export const ROUTES = {
  SESSION: "/session",
} as const;

/**
 * Checks if the current page is the register session flow.
 * Used to determine whether to skip wildcard session creation during login.
 */
export function isRegisterSessionFlow(): boolean {
  return window.location.pathname === ROUTES.SESSION;
}
