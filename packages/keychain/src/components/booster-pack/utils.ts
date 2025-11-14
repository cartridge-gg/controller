import { ethers } from "ethers";

const BASE_URL =
  "https://storage.googleapis.com/c7e-prod-static/media/devconnect";

// ===== API Integration =====

/**
 * API Types
 */
export interface ClaimCreditsMessage {
  account_username: string;
  amount: string; // hex format (e.g., "0xa") - Note: backend uses hardcoded 150 credits for security
}

export interface ClaimCreditsRequest {
  account_username: string;
  message: ClaimCreditsMessage;
  signature: string;
}

export interface ClaimCreditsResponse {
  success: boolean;
  credits_granted: number;
  new_balance: number;
  message?: string;
}

export interface CheckAssetResponse {
  value: number;
  type: string;
}

/**
 * Derive Ethereum address from private key
 */
export function deriveEthereumAddress(privateKey: string): string {
  // Ensure 0x prefix
  const key = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const wallet = new ethers.Wallet(key);
  return wallet.address;
}

/**
 * Sign EIP-191 message with private key
 * @param privateKey - Ethereum private key
 * @param message - Message object to sign
 * @returns Signature as hex string
 */
export async function signClaimMessage(
  privateKey: string,
  message: ClaimCreditsMessage,
): Promise<string> {
  // Ensure 0x prefix
  const key = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const wallet = new ethers.Wallet(key);

  // Serialize message to JSON string for signing
  const messageString = JSON.stringify(message);

  // Sign using EIP-191 (Ethereum personal sign)
  // ethers.signMessage automatically adds the "\x19Ethereum Signed Message:\n" prefix
  const signature = await wallet.signMessage(messageString);

  return signature;
}

/**
 * Check asset eligibility for an Ethereum address
 * @param address - Ethereum address to check
 * @returns Asset value and type
 */
export async function checkAssetEligibility(
  address: string,
): Promise<CheckAssetResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_CARTRIDGE_API_URL}/booster/check_for_asset`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    },
  );

  if (!response.ok) {
    throw new Error(`Asset check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Claim booster pack credits
 * @param request - Claim request with signature
 * @returns Claim response with credit details
 */
export async function claimBoosterCredits(
  request: ClaimCreditsRequest,
): Promise<ClaimCreditsResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_CARTRIDGE_API_URL}/booster/claim_credits`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claim failed: ${errorText}`);
  }

  return response.json();
}

/**
 * Generate the image URL for an asset based on backend response
 * @param assetType - Asset type from backend API (lowercase, e.g., "credits", "mystery")
 * @param assetValue - Asset value already scaled by backend (e.g., 150, 10, 3000)
 * @returns Full URL to the asset image
 */
export function assetTokenImageUrl(assetType: string): string {
  // Backend returns lowercase type names, normalize to uppercase for comparison
  const normalizedType = assetType.toUpperCase();

  // Handle MYSTERY_ASSET separately (backend returns "mystery" with no value)
  if (normalizedType === "MYSTERY" || normalizedType === "MYSTERY_ASSET") {
    return `${BASE_URL}/MYSTERY_ASSET.png`;
  }

  switch (normalizedType) {
    case "CREDITS":
      return `${BASE_URL}/CREDITS_150000000000000000000.png`;
    case "SURVIVOR":
      return `${BASE_URL}/SURVIVOR_10000000000000000000.png`;
    case "LORDS":
      return `${BASE_URL}/LORDS_75000000000000000000.png`;
    case "NUMS":
      return `${BASE_URL}/NUMS_2000000000000000000000.png`;
    case "PAPER":
      return `${BASE_URL}/PAPER_3000000000000000000000.png`;
    default:
      // Fallback for unknown asset types
      return `${BASE_URL}/EXPLAINER.png`;
  }
}

export function assetGameTokenImageUrl(assetType: string): string {
  switch (assetType) {
    case "LS2_GAME":
      return `${BASE_URL}/LS2_GAME.png`;
    case "NUMS_GAME":
      return `${BASE_URL}/NUMS_GAME.png`;
    case "REALM":
      return `${BASE_URL}/DARK_SHUFFLE_GAME.png`;
    default:
      return `${BASE_URL}/EXPLAINER.png`;
  }
}
