// Global store for all connection callbacks
interface Callbacks {
  resolve?: (result: unknown) => void;
  reject?: (error: unknown) => void;
  onCancel?: () => void;
  [key: string]: unknown;
}

const CALLBACKS_KEY = "__cartridge_controller_callbacks";
const CALLBACK_COUNTER_KEY = "__cartridge_controller_callback_counter";

const fallbackCallbacks = new Map<string, Callbacks>();

const getGlobalCallbacks = (): Map<string, Callbacks> => {
  if (typeof window === "undefined") {
    return fallbackCallbacks;
  }

  const globalWindow = window as typeof window & {
    [CALLBACKS_KEY]?: Map<string, Callbacks>;
  };

  if (!globalWindow[CALLBACKS_KEY]) {
    globalWindow[CALLBACKS_KEY] = fallbackCallbacks;
  }

  return globalWindow[CALLBACKS_KEY];
};

let callbackIdCounter = 0;

export function storeCallbacks(id: string, callbacks: Callbacks) {
  getGlobalCallbacks().set(id, callbacks);
}

export function getCallbacks(id: string) {
  return getGlobalCallbacks().get(id);
}

export function cleanupCallbacks(id: string) {
  getGlobalCallbacks().delete(id);
}

export function generateCallbackId(): string {
  if (typeof window !== "undefined") {
    const globalWindow = window as typeof window & {
      [CALLBACK_COUNTER_KEY]?: number;
    };
    const next = (globalWindow[CALLBACK_COUNTER_KEY] ?? 0) + 1;
    globalWindow[CALLBACK_COUNTER_KEY] = next;
    return `${next}`;
  }

  return `${++callbackIdCounter}`;
}
