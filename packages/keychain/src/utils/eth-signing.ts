import { privateKeyToAccount } from "viem/accounts";

/**
 * Signs an Ethereum message using a private key directly
 * @param message - The message to sign
 * @param privateKey - The Ethereum private key (with or without 0x prefix)
 * @returns The signature as a hex string
 */
export async function signMessageWithPrivateKey(
  message: string,
  privateKey: string,
): Promise<string> {
  // Ensure private key has 0x prefix
  const formattedPrivateKey = privateKey.startsWith("0x")
    ? (privateKey as `0x${string}`)
    : (`0x${privateKey}` as `0x${string}`);

  // Create account from private key
  const account = privateKeyToAccount(formattedPrivateKey);

  // Sign the message
  const signature = await account.signMessage({ message });

  return signature;
}

/**
 * Derives the Ethereum address from a private key
 * @param privateKey - The Ethereum private key (with or without 0x prefix)
 * @returns The Ethereum address
 */
export function getAddressFromPrivateKey(privateKey: string): string {
  const formattedPrivateKey = privateKey.startsWith("0x")
    ? (privateKey as `0x${string}`)
    : (`0x${privateKey}` as `0x${string}`);

  const account = privateKeyToAccount(formattedPrivateKey);
  return account.address;
}
