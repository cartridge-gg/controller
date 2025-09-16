import { ec, encode, stark } from "starknet";

/**
 * Derives an encryption key from a password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts a private key using AES-GCM with a password-derived key
 * Returns a base64-encoded string containing salt, iv, and encrypted data
 */
export async function encryptPrivateKey(
  privateKey: string,
  password: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(privateKey),
  );

  // Combine salt, iv, and encrypted data
  const combined = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength,
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts an encrypted private key using the provided password
 * Expects a base64-encoded string containing salt, iv, and encrypted data
 */
export async function decryptPrivateKey(
  encryptedData: string,
  password: string,
): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

  // Extract salt, iv, and encrypted data
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encrypted,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Generates a new StarkNet keypair using starknet.js
 * Returns the private key and public key as hex strings
 */
export function generateStarknetKeypair(): {
  privateKey: string;
  publicKey: string;
} {
  // Generate a random private key using stark.randomAddress()
  // This generates a valid StarkNet private key
  const privateKey = stark.randomAddress();

  // Get the corresponding public key using ec.starkCurve.getStarkKey
  const publicKey = ec.starkCurve.getStarkKey(privateKey);

  return {
    privateKey: encode.addHexPrefix(privateKey),
    publicKey: encode.addHexPrefix(publicKey),
  };
}
