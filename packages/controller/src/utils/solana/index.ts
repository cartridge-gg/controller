import * as sol from "micro-sol-signer";
import bs58 from "bs58";

// Re-export from micro-sol-signer
export * from "micro-sol-signer";

// Export our custom utilities
export { Connection } from "./connection";
export * from "./spl-token";

// Additional compatibility layer for easier migration
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

  toBuffer(): Buffer {
    return Buffer.from(this.toBytes());
  }

  equals(other: PublicKey | string): boolean {
    const otherKey = other instanceof PublicKey ? other.toString() : other;
    return this._publicKey === otherKey;
  }

  toBase58(): string {
    return this._publicKey;
  }
}

// Transaction compatibility wrapper
export class Transaction {
  private _transaction: any;
  public signatures: Array<{
    signature: Uint8Array | null;
    publicKey: PublicKey;
  }> = [];
  public feePayer?: PublicKey;
  public recentBlockhash?: string;

  constructor() {
    // We'll build instructions array and serialize using micro-sol-signer
    this._instructions = [];
  }

  private _instructions: any[];

  add(...instructions: any[]): Transaction {
    this._instructions.push(...instructions);
    return this;
  }

  static from(buffer: Uint8Array | Buffer | number[]): Transaction {
    // Decode using micro-sol-signer
    const bytes =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const decoded = sol.Transaction.decode(bytes);

    // Create a new Transaction and populate it
    const tx = new Transaction();
    // Note: This would need proper mapping from decoded to our wrapper
    // For now, storing the raw decoded transaction
    tx._transaction = decoded;
    return tx;
  }

  serialize(_options?: { requireAllSignatures?: boolean }): Buffer {
    // Build transaction using micro-sol-signer
    if (this._transaction) {
      // If we have a decoded transaction, re-serialize it
      return Buffer.from(sol.Transaction.encode(this._transaction));
    }

    // Otherwise build from instructions
    // This would need proper implementation using micro-sol-signer's API
    throw new Error("Transaction serialization not fully implemented");
  }

  serializeMessage(): Buffer {
    // Serialize just the message part
    throw new Error("Message serialization not fully implemented");
  }
}

// Versioned transaction support
export class VersionedTransaction {
  constructor(
    public message: any,
    public signatures: Uint8Array[],
  ) {}

  static deserialize(serialized: Uint8Array): VersionedTransaction {
    const decoded = sol.Transaction.decode(serialized);
    // Map to VersionedTransaction format
    return new VersionedTransaction(decoded, []);
  }

  serialize(): Uint8Array {
    return sol.Transaction.encode(this.message);
  }
}
