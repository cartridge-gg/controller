import * as fs from "fs/promises";
import * as path from "path";
import { CallbackServer } from "./server";

interface SessionSigner {
  privKey: string;
  pubKey: string;
}

interface SessionInfo {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

interface SessionData {
  signer?: SessionSigner;
  session?: SessionInfo;
  policies?: any;
  lastUsedConnector?: string;
  [key: string]: any;
}

/**
 * Implements a file system backend.
 * This is designed for Node.js environments to store session data on the filesystem.
 */
export class NodeBackend {
  private basePath: string;
  private sessionFile: string;
  private data: SessionData = {};
  private callbackServer?: CallbackServer;

  constructor(basePath: string) {
    if (!basePath) {
      throw new Error("basePath is required for NodeBackend");
    }
    this.basePath = basePath;
    this.sessionFile = path.join(this.basePath, "session.json");
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.basePath);
    } catch {
      try {
        await fs.mkdir(this.basePath, { recursive: true });
      } catch (error: any) {
        throw new Error(
          `Failed to create directory ${this.basePath}: ${error.message}`,
        );
      }
    }
  }

  private async loadData(): Promise<void> {
    try {
      const content = await fs.readFile(this.sessionFile, "utf-8");
      const parsed = JSON.parse(content);

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid session data format");
      }

      this.data = parsed;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw new Error(`Failed to load session data: ${error.message}`);
        }
      }
      this.data = {};
    }
  }

  private async saveData(): Promise<void> {
    try {
      await this.ensureDirectoryExists();
      await fs.writeFile(
        this.sessionFile,
        JSON.stringify(this.data, null, 2),
        "utf-8",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to save session data: ${error.message}`);
      }
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!key) {
      throw new Error("Key is required");
    }

    await this.loadData();
    return this.data[key] ? JSON.stringify(this.data[key]) : null;
  }

  async set(key: string, value: string): Promise<void> {
    if (!key) {
      throw new Error("Key is required");
    }
    if (!value) {
      throw new Error("Value is required");
    }

    await this.loadData();
    try {
      this.data[key] = JSON.parse(value);
      await this.saveData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to set ${key}: ${error.message}`);
      }
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    if (!key) {
      throw new Error("Key is required");
    }

    await this.loadData();
    delete this.data[key];
    await this.saveData();
  }

  async getRedirectUri(): Promise<string> {
    try {
      this.callbackServer = new CallbackServer();
      return await this.callbackServer.listen();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to start callback server: ${error.message}`);
      }
      throw error;
    }
  }

  async waitForCallback(): Promise<string | null> {
    if (!this.callbackServer) {
      throw new Error("Callback server not initialized");
    }
    return await this.callbackServer.waitForCallback();
  }

  openLink(url: string): void {
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`\n\t Open url to authorize session: ${url}`);
  }
}
