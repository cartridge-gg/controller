import bs58 from "bs58";

export interface ConnectionConfig {
  commitment?: "processed" | "confirmed" | "finalized";
}

export class Connection {
  private rpcUrl: string;
  private commitment: string;

  constructor(rpcUrl: string, config?: ConnectionConfig) {
    this.rpcUrl = rpcUrl;
    this.commitment = config?.commitment || "confirmed";
  }

  private async rpcRequest(method: string, params: any[] = []) {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    const result = await this.rpcRequest("sendTransaction", [
      encoded,
      {
        encoding: "base58",
        skipPreflight: options?.skipPreflight || false,
        maxRetries: options?.maxRetries,
      },
    ]);
    return result;
  }

  async getAccountInfo(publicKey: string) {
    const result = await this.rpcRequest("getAccountInfo", [
      publicKey,
      { encoding: "base64", commitment: this.commitment },
    ]);
    return result;
  }
}
