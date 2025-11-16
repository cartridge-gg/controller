/**
 * Cryptographic utilities for encrypting/decrypting localStorage snapshots.
 *
 * This module implements AES-GCM authenticated encryption for securing localStorage
 * snapshots during cross-origin transfer via URL fragments and cookies.
 *
 * **Security Model:**
 * - Encryption key K stored in cookie on x.cartridge.gg (first-party only)
 * - Encrypted ciphertext B passed via URL fragment (never sent to server)
 * - Key and ciphertext separation ensures defense-in-depth
 * - AEAD provides both confidentiality and integrity protection
 *
 * @module snapshotCrypto
 */

/**
 * Generate a random 256-bit symmetric encryption key using WebCrypto API.
 *
 * @returns Promise resolving to a CryptoKey suitable for AES-GCM encryption
 * @throws Error if WebCrypto API is not available
 *
 * @example
 * ```typescript
 * const key = await generateEncryptionKey();
 * // Use key for encryption/decryption
 * ```
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  if (!crypto?.subtle) {
    throw new Error("WebCrypto API not available");
  }

  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256, // 256-bit key
    },
    true, // extractable (needed for export)
    ["encrypt", "decrypt"],
  );
}

/**
 * Export a CryptoKey to raw bytes format.
 *
 * @param key - The CryptoKey to export
 * @returns Promise resolving to Uint8Array of raw key bytes
 */
export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(exported);
}

/**
 * Import raw key bytes as a CryptoKey.
 *
 * @param keyBytes - Raw key bytes (must be 32 bytes for AES-256)
 * @returns Promise resolving to CryptoKey
 */
export async function importKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  if (keyBytes.length !== 32) {
    throw new Error("Invalid key length: expected 32 bytes for AES-256");
  }

  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encode bytes to base64url format (URL-safe, no padding).
 *
 * Base64url is used instead of standard base64 because:
 * - Safe for use in URL fragments and query parameters
 * - No padding (=) needed
 * - Uses - and _ instead of + and /
 *
 * @param bytes - Bytes to encode
 * @returns Base64url encoded string
 */
export function base64urlEncode(bytes: Uint8Array): string {
  // Convert to base64
  const base64 = btoa(String.fromCharCode(...bytes));

  // Convert to base64url (URL-safe)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode base64url string to bytes.
 *
 * @param str - Base64url encoded string
 * @returns Decoded bytes
 * @throws Error if string is invalid base64url
 */
export function base64urlDecode(str: string): Uint8Array {
  // Convert from base64url to base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  // Decode base64 to bytes
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Encrypt a localStorage snapshot using AES-GCM authenticated encryption.
 *
 * **Format:**
 * The output is a concatenation of: IV (12 bytes) + Ciphertext + Auth Tag (16 bytes)
 * All base64url-encoded into a single string.
 *
 * **Security Properties:**
 * - AES-GCM provides authenticated encryption (AEAD)
 * - Random IV ensures each encryption is unique
 * - Auth tag prevents tampering
 * - 256-bit key provides strong security margin
 *
 * @param data - The localStorage snapshot object to encrypt
 * @param key - The AES-GCM encryption key
 * @returns Promise resolving to base64url-encoded encrypted blob
 * @throws Error if encryption fails
 *
 * @example
 * ```typescript
 * const snapshot = { "@cartridge/user": "alice", ... };
 * const key = await generateEncryptionKey();
 * const encrypted = await encryptSnapshot(snapshot, key);
 * // encrypted is base64url string containing IV + ciphertext + tag
 * ```
 */
export async function encryptSnapshot(
  data: Record<string, string | null>,
  key: CryptoKey,
): Promise<string> {
  if (!crypto?.subtle) {
    throw new Error("WebCrypto API not available");
  }

  // Serialize data to JSON
  const jsonString = JSON.stringify(data);
  const plaintext = new TextEncoder().encode(jsonString);

  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt with AES-GCM
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128, // 16 bytes auth tag
    },
    key,
    plaintext,
  );

  // Concatenate: IV + ciphertext (which includes auth tag)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Encode to base64url
  return base64urlEncode(combined);
}

/**
 * Decrypt an encrypted localStorage snapshot.
 *
 * This function reverses the encryption performed by `encryptSnapshot()`.
 * It extracts the IV, verifies the auth tag, and decrypts the ciphertext.
 *
 * @param encryptedBlob - Base64url-encoded encrypted data (from encryptSnapshot)
 * @param key - The AES-GCM decryption key (must match encryption key)
 * @returns Promise resolving to decrypted snapshot object
 * @throws Error if decryption fails or auth tag is invalid
 *
 * @example
 * ```typescript
 * const snapshot = await decryptSnapshot(encryptedBlob, key);
 * // snapshot is the original object: { "@cartridge/user": "alice", ... }
 * ```
 */
export async function decryptSnapshot(
  encryptedBlob: string,
  key: CryptoKey,
): Promise<Record<string, string | null>> {
  if (!crypto?.subtle) {
    throw new Error("WebCrypto API not available");
  }

  // Decode from base64url
  const combined = base64urlDecode(encryptedBlob);

  // Extract IV (first 12 bytes) and ciphertext (rest)
  if (combined.length < 12) {
    throw new Error("Invalid encrypted blob: too short");
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  // Decrypt with AES-GCM (will throw if auth tag is invalid)
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128,
    },
    key,
    ciphertext,
  );

  // Decode plaintext to JSON
  const jsonString = new TextDecoder().decode(plaintext);
  return JSON.parse(jsonString);
}

/**
 * Zero out a CryptoKey's sensitive data (best effort).
 *
 * Note: JavaScript doesn't provide guaranteed memory zeroing,
 * but we can clear references and trigger GC.
 *
 * @param key - The key to zero
 */
export function zeroKey(key: CryptoKey): void {
  // CryptoKey objects are immutable, but we can remove references
  // The browser's GC will eventually clean up the memory
  // This is mostly symbolic but good practice
  Object.freeze(key);
}
