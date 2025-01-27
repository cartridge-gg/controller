import { Connection } from "@cartridge/penpal";
import { AsyncMethodReturns } from "@cartridge/penpal";
import { connectToController } from "./index";
import { ConnectionCtx } from "./index";
import Controller from "../controller";
import { isIframe } from "@cartridge/utils";

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

type ConnectionCallbacks = {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setContext: (ctx: ConnectionCtx | undefined) => void;
  setController: (controller: Controller | undefined) => void;
  setParent: (parent: ParentMethods) => void;
};

class ConnectionManager {
  private static instance: ConnectionManager;
  private connection: Connection<ParentMethods> | null = null;
  private isInitialized = false;

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  initialize(callbacks: ConnectionCallbacks): void {
    if (this.isInitialized || !isIframe()) {
      return;
    }

    this.isInitialized = true;

    this.connection = connectToController<ParentMethods>({
      setOrigin: callbacks.setOrigin,
      setRpcUrl: callbacks.setRpcUrl,
      setContext: callbacks.setContext,
      setController: callbacks.setController,
    });

    this.connection.promise.then((parent) => {
      callbacks.setParent(parent);
    });
  }

  destroy(): void {
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }
    this.isInitialized = false;
  }
}

export const connectionManager = ConnectionManager.getInstance();
