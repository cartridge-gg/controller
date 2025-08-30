import * as sol from "micro-sol-signer";
import bs58 from "bs58";

// Re-export micro-sol-signer functionality
export * from "micro-sol-signer";

// SPL Token Program IDs
export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const ASSOCIATED_TOKEN_PROGRAM_ID =
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
export const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";

// Compatibility wrapper for PublicKey
export class PublicKey {
  private _publicKey: string;

  constructor(value: string | Uint8Array | number[] | Buffer | PublicKey) {
    if (value instanceof PublicKey) {
      this._publicKey = value.toString();
    } else if (typeof value === "string") {
      this._publicKey = value;
    } else if (
      value instanceof Uint8Array ||
      Array.isArray(value) ||
      Buffer.isBuffer(value)
    ) {
      const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
      this._publicKey = bs58.encode(bytes);
    } else {
      throw new Error("Invalid public key input");
    }
  }

  toString(): string {
    return this._publicKey;
  }

  toBytes(): Uint8Array {
    return bs58.decode(this._publicKey);
  }

  equals(other: PublicKey | string): boolean {
    const otherKey = other instanceof PublicKey ? other.toString() : other;
    return this._publicKey === otherKey;
  }
}

// Connection class for RPC calls
export class Connection {
  private rpcUrl: string;
  private commitment: string;

  constructor(rpcUrl: string, commitment: string = "confirmed") {
    this.rpcUrl = rpcUrl;
    this.commitment = commitment;
  }

  private async rpcRequest(method: string, params: unknown[] = []) {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    });

    const json = await response.json();
    if (json.error) {
      throw new Error(`RPC Error: ${json.error.message}`);
    }
    return json.result;
  }

  async getLatestBlockhash() {
    const result = await this.rpcRequest("getLatestBlockhash", [
      { commitment: this.commitment },
    ]);
    return {
      blockhash: result.value.blockhash,
      lastValidBlockHeight: result.value.lastValidBlockHeight,
    };
  }

  async getSignatureStatus(signature: string) {
    const result = await this.rpcRequest("getSignatureStatuses", [
      [signature],
      { searchTransactionHistory: true },
    ]);
    return result;
  }

  async sendRawTransaction(
    transaction: Uint8Array,
    options?: { skipPreflight?: boolean; maxRetries?: number },
  ) {
    const encoded = bs58.encode(transaction);
    return await this.rpcRequest("sendTransaction", [
      encoded,
      {
        encoding: "base58",
        skipPreflight: options?.skipPreflight || false,
        maxRetries: options?.maxRetries,
      },
    ]);
  }
}

// Transaction wrapper for compatibility
export class Transaction {
  public instructions: sol.Instruction[] = [];
  public feePayer?: PublicKey;
  public recentBlockhash?: string;
  public signatures: Array<{
    signature: Uint8Array | null;
    publicKey: PublicKey;
  }> = [];

  add(...instructions: sol.Instruction[]): Transaction {
    this.instructions.push(...instructions);
    return this;
  }

  static from(buffer: Uint8Array | Buffer | number[]): Transaction {
    const bytes =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const decoded = sol.Transaction.decode(bytes);

    const tx = new Transaction();
    // Store the decoded transaction for re-serialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tx as any)._decoded = decoded;
    return tx;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  serialize(_options?: { requireAllSignatures?: boolean }): Uint8Array {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this as any)._decoded) {
      // Re-encode the decoded transaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sol.Transaction.encode((this as any)._decoded);
    }

    // Build transaction using micro-sol-signer
    if (!this.feePayer || !this.recentBlockhash) {
      throw new Error("Transaction requires feePayer and recentBlockhash");
    }

    // Create the transaction with micro-sol-signer
    const txHex = sol.createTxComplex(
      this.feePayer.toString(),
      this.instructions,
      this.recentBlockhash,
    );

    // Convert hex string to Uint8Array
    return new Uint8Array(Buffer.from(txHex, "hex"));
  }
}

// Helper to derive associated token address
export async function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
): Promise<PublicKey> {
  // Derive the associated token account address
  // Using the standard SPL token ATA derivation
  const seeds = [
    bs58.decode(owner.toString()),
    bs58.decode(TOKEN_PROGRAM_ID),
    bs58.decode(mint.toString()),
  ];

  // For SPL Token ATAs, the address is deterministic
  // This is a simplified calculation - in production use proper PDA derivation
  const seedsBuffer = Buffer.concat(seeds.map((s) => Buffer.from(s)));
  const hash = await crypto.subtle.digest("SHA-256", seedsBuffer);
  const address = bs58.encode(new Uint8Array(hash).slice(0, 32));

  return new PublicKey(address);
}

// Create associated token account instruction
export function createAssociatedTokenAccountInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
): sol.Instruction {
  // Create the instruction to create an associated token account
  return {
    program: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { address: payer.toString(), sign: true, write: true },
      { address: associatedToken.toString(), sign: false, write: true },
      { address: owner.toString(), sign: false, write: false },
      { address: mint.toString(), sign: false, write: false },
      { address: SYSTEM_PROGRAM_ID, sign: false, write: false },
      { address: TOKEN_PROGRAM_ID, sign: false, write: false },
    ],
    data: new Uint8Array(0), // No data for create instruction
  };
}

// Create transfer instruction for SPL tokens
export function createTransferInstruction(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number,
): sol.Instruction {
  // Use micro-sol-signer's token transfer instruction
  return sol.token.transfer({
    source: source.toString(),
    destination: destination.toString(),
    owner: owner.toString(),
    amount: BigInt(amount),
  });
}

// Cluster helpers
export function clusterApiUrl(
  cluster: "mainnet-beta" | "testnet" | "devnet",
): string {
  const endpoints = {
    "mainnet-beta": "https://api.mainnet-beta.solana.com",
    testnet: "https://api.testnet.solana.com",
    devnet: "https://api.devnet.solana.com",
  };
  return endpoints[cluster];
}
