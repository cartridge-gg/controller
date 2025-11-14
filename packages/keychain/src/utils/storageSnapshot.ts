import type {
  SnapshotOptions,
  RestoreOptions,
  ClearOptions,
} from "./storageSnapshot.types";

/**
 * Prefix for localStorage keys that should be synchronized via snapshot cookie.
 * Only keys starting with this prefix will be included in the snapshot.
 */
const STORAGE_KEY_PREFIX = "@cartridge/";

/**
 * Default cookie configuration
 */
const DEFAULT_COOKIE_NAME = "keychain_snapshot";
const DEFAULT_COOKIE_PATH =
  "/__snapshot_never_hit_this_path_should_never_be_hit__";
const DEFAULT_MAX_AGE_SECONDS = 300; // 5 minutes

/**
 * Creates a snapshot of localStorage items with the `cartridge/` prefix and stores
 * them in a "dead-path" cookie that will never be sent over the network.
 *
 * **Storage Access API Context:**
 * This function is designed to work around browser behavior where third-party iframes
 * have partitioned localStorage access. By storing localStorage data in a cookie on
 * a dead path (one that never matches any route), we can:
 * - Keep the data client-side only (never sent to server)
 * - Access it after calling `document.requestStorageAccess()` in an iframe
 * - Restore the original localStorage state in the iframe context
 *
 * **Cookie Attributes:**
 * - Path: `/__snapshot_never_hit__` - Ensures cookie is never sent in HTTP requests
 * - Secure: Required for cross-site cookies
 * - SameSite=None: Allows third-party iframe access after Storage Access API grant
 * - Host-only: No Domain attribute, scoped to exact host (x.cartridge.gg)
 * - Short TTL: 5 minutes to minimize exposure window
 *
 * **Security Considerations:**
 * - NEVER include authentication tokens or sensitive credentials in localStorage
 * - Only sync keys prefixed with `cartridge/` to avoid third-party data
 * - Cookie expires quickly (5 min) to limit exposure
 * - Dead path prevents accidental server transmission
 *
 * @param options - Configuration options for the snapshot
 *
 * @example
 * ```typescript
 * // Before redirecting to external site
 * snapshotLocalStorageToCookie();
 * window.location.href = redirectUrl;
 * ```
 */
export function snapshotLocalStorageToCookie(options?: SnapshotOptions): void {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookiePath = options?.cookiePath ?? DEFAULT_COOKIE_PATH;
  const maxAgeSeconds = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;

  try {
    // Check if localStorage is available
    if (typeof localStorage === "undefined") {
      console.warn(
        "[storageSnapshot] localStorage not available, skipping snapshot",
      );
      return;
    }

    // Gather all localStorage keys with the cartridge/ prefix
    const snapshot: Record<string, string | null> = {};
    let keysFound = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        snapshot[key] = localStorage.getItem(key);
        keysFound++;
      }
    }

    if (keysFound === 0) {
      console.log(
        "[storageSnapshot] No keys with prefix found, skipping snapshot",
      );
      return;
    }

    // Serialize to JSON and URL-encode
    const jsonPayload = JSON.stringify(snapshot);
    const encodedPayload = encodeURIComponent(jsonPayload);

    // Build cookie string
    // Format: name=value; Path=path; Secure; SameSite=None; Max-Age=seconds
    const cookieString = [
      `${cookieName}=${encodedPayload}`,
      `Path=${cookiePath}`,
      "Secure",
      "SameSite=None",
      `Max-Age=${maxAgeSeconds}`,
    ].join("; ");

    document.cookie = cookieString;

    console.log(
      `[storageSnapshot] Created snapshot with ${keysFound} keys (${encodedPayload.length} bytes)`,
    );
  } catch (error) {
    console.error("[storageSnapshot] Failed to create snapshot:", error);
    // Don't throw - allow application to continue even if snapshot fails
  }
}

/**
 * Restores localStorage items from a snapshot cookie created by `snapshotLocalStorageToCookie()`.
 *
 * **Usage Context:**
 * This function should be called immediately after successfully calling
 * `document.requestStorageAccess()` in an iframe context. The Storage Access API
 * grants the iframe access to its cookies, allowing us to read the snapshot cookie
 * and restore localStorage to its previous state.
 *
 * **Browser Compatibility:**
 * - Safari: Full support for Storage Access API
 * - Chrome: Supports Storage Access API (with user gesture requirement)
 * - Firefox: Supports Storage Access API
 * - iOS Safari: Full support
 *
 * **Flow:**
 * 1. Top-level page creates snapshot before redirect
 * 2. User navigates back to iframe context
 * 3. User clicks button (user gesture)
 * 4. `document.requestStorageAccess()` grants cookie access
 * 5. This function reads cookie and restores localStorage
 * 6. Cookie is cleared (optional but recommended)
 *
 * @param options - Configuration options for restoration
 *
 * @example
 * ```typescript
 * // In iframe after user gesture
 * const granted = await document.requestStorageAccess();
 * if (granted) {
 *   restoreLocalStorageFromCookie({ clearAfterRestore: true });
 * }
 * ```
 */
export function restoreLocalStorageFromCookie(options?: RestoreOptions): void {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookiePath = options?.cookiePath ?? DEFAULT_COOKIE_PATH;
  const clearAfterRestore = options?.clearAfterRestore ?? true;

  try {
    // Check if localStorage is available
    if (typeof localStorage === "undefined") {
      console.warn(
        "[storageSnapshot] localStorage not available, cannot restore",
      );
      return;
    }

    // Check if document.cookie is available
    if (
      typeof document === "undefined" ||
      typeof document.cookie === "undefined"
    ) {
      console.warn(
        "[storageSnapshot] document.cookie not available, cannot restore",
      );
      return;
    }

    // Extract cookie value
    const cookies = document.cookie.split("; ");
    const targetCookie = cookies.find((cookie) =>
      cookie.startsWith(`${cookieName}=`),
    );

    if (!targetCookie) {
      console.log(`[storageSnapshot] No snapshot cookie found (${cookieName})`);
      return;
    }

    // Extract value after "cookieName="
    const encodedValue = targetCookie.substring(cookieName.length + 1);
    if (!encodedValue) {
      console.warn("[storageSnapshot] Snapshot cookie is empty");
      return;
    }

    // Decode and parse JSON
    const decodedValue = decodeURIComponent(encodedValue);
    const snapshot: Record<string, string | null> = JSON.parse(decodedValue);

    // Restore to localStorage
    let restoredCount = 0;
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
      restoredCount++;
    }

    console.log(
      `[storageSnapshot] Restored ${restoredCount} keys from snapshot`,
    );

    // Clear cookie if requested
    if (clearAfterRestore) {
      clearSnapshotCookie({ cookieName, cookiePath });
    }
  } catch (error) {
    console.error("[storageSnapshot] Failed to restore from snapshot:", error);
    // Don't throw - allow application to continue even if restore fails
  }
}

/**
 * Clears the snapshot cookie by setting its Max-Age to 0.
 *
 * This should be called after successfully restoring localStorage to prevent
 * the cookie from being used again or lingering in the browser.
 *
 * @param options - Configuration options for clearing
 *
 * @example
 * ```typescript
 * clearSnapshotCookie();
 * ```
 */
export function clearSnapshotCookie(options?: ClearOptions): void {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookiePath = options?.cookiePath ?? DEFAULT_COOKIE_PATH;

  try {
    // Set cookie with Max-Age=0 to expire it immediately
    const cookieString = [
      `${cookieName}=`,
      `Path=${cookiePath}`,
      "Secure",
      "SameSite=None",
      "Max-Age=0",
    ].join("; ");

    document.cookie = cookieString;

    console.log(`[storageSnapshot] Cleared snapshot cookie (${cookieName})`);
  } catch (error) {
    console.error("[storageSnapshot] Failed to clear snapshot cookie:", error);
    // Don't throw - this is a cleanup operation
  }
}
