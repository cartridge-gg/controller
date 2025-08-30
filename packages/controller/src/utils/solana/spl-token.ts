// import * as sol from "micro-sol-signer"; // Currently unused but may be needed for future implementations
import bs58 from "bs58";

// SPL Token Program IDs
export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const ASSOCIATED_TOKEN_PROGRAM_ID =
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

// Helper to get associated token address
export function getAssociatedTokenAddress(mint: string, owner: string): string {
  // This is a simplified version - the actual derivation uses PDA
  // For production, you'd need to implement the full PDA derivation
  // or use micro-sol-signer's built-in helpers if available
  const seeds = [
    bs58.decode(owner),
    bs58.decode(TOKEN_PROGRAM_ID),
    bs58.decode(mint),
  ];

  // Note: This is a placeholder - actual implementation would need
  // proper PDA derivation. micro-sol-signer may have helpers for this.
  return deriveAddress(seeds, ASSOCIATED_TOKEN_PROGRAM_ID);
}

// Derive address from seeds (simplified - needs proper implementation)
function deriveAddress(seeds: Uint8Array[], _programId: string): string {
  // This would need proper PDA derivation logic
  // For now, returning a placeholder
  const combined = new Uint8Array(
    seeds.reduce((acc, seed) => acc + seed.length, 0),
  );
  let offset = 0;
  for (const seed of seeds) {
    combined.set(seed, offset);
    offset += seed.length;
  }
  // This is not the correct implementation - just a placeholder
  return bs58.encode(combined.slice(0, 32));
}

// Create associated token account instruction
export function createAssociatedTokenAccountInstruction(
  payer: string,
  associatedToken: string,
  owner: string,
  mint: string,
) {
  // Using micro-sol-signer's token helpers if available
  // Otherwise, we'd need to manually construct the instruction
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedToken, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: mint, isSigner: false, isWritable: false },
    {
      pubkey: "11111111111111111111111111111111",
      isSigner: false,
      isWritable: false,
    }, // System program
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return {
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys,
    data: new Uint8Array(0), // No data for create instruction
  };
}

// Create transfer instruction
export function createTransferInstruction(
  source: string,
  destination: string,
  owner: string,
  amount: bigint,
) {
  // Instruction discriminator for Transfer is 3
  const discriminator = 3;
  const data = new Uint8Array(9);
  data[0] = discriminator;

  // Write amount as little-endian u64
  const view = new DataView(data.buffer);
  view.setBigUint64(1, amount, true);

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false },
  ];

  return {
    programId: TOKEN_PROGRAM_ID,
    keys,
    data,
  };
}
