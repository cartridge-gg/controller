import type {
  SnapshotOptions,
  RestoreOptions,
  ClearOptions,
} from "./storageSnapshot.types";
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptSnapshot,
  decryptSnapshot,
  base64urlEncode,
  base64urlDecode,
} from "./snapshotCrypto";

/**
 * Prefix for localStorage keys that should be synchronized via snapshot cookie.
 * Only keys starting with this prefix will be included in the snapshot.
 */
const STORAGE_KEY_PREFIX = "@cartridge/";

/**
 * Default cookie configuration
 */
const DEFAULT_COOKIE_NAME = "keychain_snapshot_key";
const DEFAULT_COOKIE_PATH = "/";
const DEFAULT_MAX_AGE_SECONDS = 300; // 5 minutes

/**
 * Creates an encrypted snapshot of localStorage items with the `@cartridge/` prefix.
 *
 * **New Encrypted Architecture:**
 * This function implements a split-key encryption approach where:
 * 1. Generate random symmetric encryption key K
 * 2. Encrypt localStorage snapshot with K → ciphertext B
 * 3. Store K in cookie (on x.cartridge.gg, first-party only)
 * 4. Return B to be passed via URL fragment (never sent to server)
 *
 * **Security Model:**
 * - Encryption key K stored in cookie (accessible after Storage Access API grant)
 * - Ciphertext B passed via URL fragment (visible to app, but useless without K)
 * - Key and ciphertext separation provides defense-in-depth
 * - AEAD (AES-GCM) ensures both confidentiality and integrity
 * - Neither key nor ciphertext alone can decrypt the snapshot
 *
 * **Cookie Attributes:**
 * - Path: `/` - Accessible from all paths (needed for iframe access)
 * - Secure: Required for cross-site cookies (HTTPS only)
 * - SameSite=None: Allows third-party iframe access after Storage Access API grant (HTTPS)
 * - SameSite=Lax: Used for localhost/HTTP development (doesn't require Secure)
 * - Host-only: No Domain attribute, scoped to exact host (x.cartridge.gg)
 * - Short TTL: 5 minutes to minimize exposure window
 *
 * **Security Considerations:**
 * - NEVER include authentication tokens or sensitive credentials in localStorage
 * - Only sync keys prefixed with `@cartridge/` to avoid third-party data
 * - Cookie expires quickly (5 min) to limit exposure
 * - Encrypted blob passed in URL fragment (never sent to any server)
 * - App domain (nums.gg) sees ciphertext but not the key
 * - Keychain domain (x.cartridge.gg) has key but ciphertext only in fragment
 *
 * @param options - Configuration options for the snapshot
 * @returns Promise resolving to encrypted blob (base64url string) to be passed via URL fragment
 *
 * @example
 * ```typescript
 * // Before redirecting to external site
 * const encryptedBlob = await snapshotLocalStorageToCookie();
 * window.location.href = redirectUrl + "#kc=" + encodeURIComponent(encryptedBlob);
 * ```
 */
export async function snapshotLocalStorageToCookie(
  options?: SnapshotOptions,
): Promise<string> {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookiePath = options?.cookiePath ?? DEFAULT_COOKIE_PATH;
  const maxAgeSeconds = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;

  try {
    // Check if localStorage is available
    if (typeof localStorage === "undefined") {
      console.warn(
        "[storageSnapshot] localStorage not available, skipping snapshot",
      );
      return "";
    }

    // Gather all localStorage keys with the @cartridge/ prefix
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
      return "";
    }

    // STEP 1: Generate random encryption key
    const encryptionKey = await generateEncryptionKey();

    // STEP 2: Encrypt the snapshot
    const encryptedBlob = await encryptSnapshot(snapshot, encryptionKey);

    // STEP 3: Export key and store in cookie
    const keyBytes = await exportKey(encryptionKey);
    const keyBase64url = base64urlEncode(keyBytes);

    // Build cookie string with the encryption key
    const cookieAttributes = [
      `${cookieName}=${keyBase64url}`,
      `Path=${cookiePath}`,
      `Max-Age=${maxAgeSeconds}`,
    ];

    // Only add Secure and SameSite=None for HTTPS contexts
    // For localhost, use SameSite=Lax which works without Secure
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:"
    ) {
      cookieAttributes.push("Secure", "SameSite=None");
    } else {
      cookieAttributes.push("SameSite=Lax");
    }

    const cookieString = cookieAttributes.join("; ");
    document.cookie = cookieString;

    console.log(
      `[storageSnapshot] Created encrypted snapshot with ${keysFound} keys (${encryptedBlob.length} bytes encrypted)`,
    );

    // STEP 4: Return encrypted blob to be passed via URL fragment
    return encryptedBlob;
  } catch (error) {
    console.error("[storageSnapshot] Failed to create snapshot:", error);
    // Don't throw - allow application to continue even if snapshot fails
    return "";
  }
}

/**
 * Restores localStorage items from an encrypted snapshot passed via URL fragment.
 *
 * **New Encrypted Architecture:**
 * This function decrypts and restores localStorage using the split-key approach:
 * 1. Extract encrypted blob from URL fragment (#kc=...)
 * 2. After Storage Access API grant, read encryption key from cookie
 * 3. Decrypt blob with key
 * 4. Restore all @cartridge/* keys to localStorage
 * 5. Clear cookie and fragment
 *
 * **Security Model:**
 * - Encryption key K read from cookie (only accessible after Storage Access API)
 * - Ciphertext B passed via encryptedBlob parameter (from URL fragment)
 * - AES-GCM decryption verifies integrity (tampered data rejected)
 * - Function must be called AFTER `document.requestStorageAccess()` succeeds
 *
 * **Browser Compatibility:**
 * - Safari: Full support for Storage Access API
 * - Chrome/Edge: Full support for Storage Access API
 * - Firefox: Full support for Storage Access API
 * - iOS Safari: Full support
 * - No Cookie Store API needed (simple document.cookie read)
 *
 * **Flow:**
 * 1. Top-level page creates encrypted snapshot before redirect
 * 2. User navigates back to iframe context with #kc=<encrypted_blob>
 * 3. User clicks button (user gesture)
 * 4. `document.requestStorageAccess()` grants cookie access
 * 5. This function reads key from cookie, decrypts blob, restores localStorage
 * 6. Cookie is cleared
 *
 * @param encryptedBlob - Base64url-encoded encrypted snapshot from URL fragment
 * @param options - Configuration options for restoration
 *
 * @example
 * ```typescript
 * // In iframe after user gesture
 * const granted = await document.requestStorageAccess();
 * if (granted) {
 *   // Extract from URL fragment
 *   const blob = new URLSearchParams(location.hash.slice(1)).get("kc");
 *   if (blob) {
 *     await restoreLocalStorageFromFragment(blob, { clearAfterRestore: true });
 *   }
 * }
 * ```
 */
export async function restoreLocalStorageFromFragment(
  encryptedBlob: string,
  options?: RestoreOptions,
): Promise<void> {
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

    // Validate input
    if (!encryptedBlob || encryptedBlob.length === 0) {
      console.warn("[storageSnapshot] Empty encrypted blob provided");
      return;
    }

    // STEP 1: Read encryption key from cookie
    const cookies = document.cookie.split("; ");
    const targetCookie = cookies.find((cookie) =>
      cookie.startsWith(`${cookieName}=`),
    );

    if (!targetCookie) {
      console.warn(
        `[storageSnapshot] Encryption key cookie not found (${cookieName})`,
      );
      console.warn(
        "[storageSnapshot] Make sure document.requestStorageAccess() was called first",
      );
      return;
    }

    // STEP 2: Extract and decode encryption key from cookie
    const keyBase64url = targetCookie.substring(cookieName.length + 1);
    if (!keyBase64url) {
      console.warn("[storageSnapshot] Encryption key cookie is empty");
      return;
    }

    const keyBytes = base64urlDecode(keyBase64url);
    const encryptionKey = await importKey(keyBytes);

    // STEP 3: Decrypt the snapshot
    const snapshot = await decryptSnapshot(encryptedBlob, encryptionKey);

    // STEP 4: Restore to localStorage
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
      `[storageSnapshot] Restored ${restoredCount} keys from encrypted snapshot`,
    );

    // STEP 5: Clear cookie if requested
    if (clearAfterRestore) {
      clearSnapshotCookie({ cookieName, cookiePath });
    }
  } catch (error) {
    console.error("[storageSnapshot] Failed to restore from snapshot:", error);
    if (error instanceof Error) {
      console.error("[storageSnapshot] Error details:", error.message);
    }
    // Don't throw - allow application to continue even if restore fails
  }
}

/**
 * Legacy function for backward compatibility.
 * Calls restoreLocalStorageFromFragment after extracting blob from URL fragment.
 *
 * @deprecated Use restoreLocalStorageFromFragment directly
 */
export async function restoreLocalStorageFromCookie(
  options?: RestoreOptions,
): Promise<void> {
  console.warn(
    "[storageSnapshot] restoreLocalStorageFromCookie is deprecated, use restoreLocalStorageFromFragment",
  );

  // Extract blob from URL fragment
  const hash = window.location.hash.slice(1); // Remove '#'
  const params = new URLSearchParams(hash);
  const encryptedBlob = params.get("kc");

  if (!encryptedBlob) {
    console.warn(
      "[storageSnapshot] No encrypted blob found in URL fragment (#kc=...)",
    );
    return;
  }

  return restoreLocalStorageFromFragment(encryptedBlob, options);
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
    const cookieAttributes = [
      `${cookieName}=`,
      `Path=${cookiePath}`,
      "Max-Age=0",
    ];

    // Match the same security attributes used when setting the cookie
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:"
    ) {
      cookieAttributes.push("Secure", "SameSite=None");
    } else {
      cookieAttributes.push("SameSite=Lax");
    }

    const cookieString = cookieAttributes.join("; ");

    document.cookie = cookieString;

    console.log(`[storageSnapshot] Cleared snapshot cookie (${cookieName})`);
  } catch (error) {
    console.error("[storageSnapshot] Failed to clear snapshot cookie:", error);
    // Don't throw - this is a cleanup operation
  }
}
