import * as sol from "micro-sol-signer";
import bs58 from "bs58";

// SPL Token Program IDs
export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const ASSOCIATED_TOKEN_PROGRAM_ID =
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

// Helper to get associated token address
export function getAssociatedTokenAddress(mint: string, owner: string): string {
  // Derive the associated token account address
  // This is a simplified implementation for compatibility
  const seeds = [
    bs58.decode(owner),
    bs58.decode(TOKEN_PROGRAM_ID),
    bs58.decode(mint),
  ];

  // For SPL Token ATAs, this is deterministic but simplified
  // In production, use proper PDA derivation
  const combined = Buffer.concat(seeds.map((s) => Buffer.from(s)));
  const hash = Buffer.from(combined).slice(0, 32);
  return bs58.encode(hash);
}

// Create associated token account instruction
export function createAssociatedTokenAccountInstruction(
  payer: string,
  associatedToken: string,
  owner: string,
  mint: string,
): sol.Instruction {
  // Create the instruction to create an associated token account
  return {
    program: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { address: payer, sign: true, write: true },
      { address: associatedToken, sign: false, write: true },
      { address: owner, sign: false, write: false },
      { address: mint, sign: false, write: false },
      {
        address: "11111111111111111111111111111111",
        sign: false,
        write: false,
      }, // System program
      { address: TOKEN_PROGRAM_ID, sign: false, write: false },
    ],
    data: new Uint8Array(0), // No data for create instruction
  };
}

// Create transfer instruction
export function createTransferInstruction(
  source: string,
  destination: string,
  owner: string,
  amount: bigint,
): sol.Instruction {
  // Use micro-sol-signer's token transfer instruction
  return sol.token.transfer({
    source,
    destination,
    owner,
    amount,
  });
}
