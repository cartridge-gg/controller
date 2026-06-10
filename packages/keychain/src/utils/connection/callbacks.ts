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
  // Callback ids MUST be globally unique and never reused. The keychain iframe
  // is persistent and can reload (disconnect/logout), which would reset a plain
  // counter back to "1" and cause collisions: a new connect would navigate to
  // the same `/connect?id=1` URL, so `useSearchParams` wouldn't change and the
  // connect UI would keep a stale `params` (whose `resolve` was already cleaned
  // up) instead of picking up the freshly-stored callback — and would then
  // delete the live callback via the reused id. Result: the parent's
  // `keychain.connect()` never resolves. A UUID guarantees a distinct URL per
  // connect, forcing a re-parse and preventing stale-id cleanup collisions.
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID: counter + random
  // suffix so ids stay unique even if the counter base resets on reload.
  if (typeof window !== "undefined") {
    const globalWindow = window as typeof window & {
      [CALLBACK_COUNTER_KEY]?: number;
    };
    const next = (globalWindow[CALLBACK_COUNTER_KEY] ?? 0) + 1;
    globalWindow[CALLBACK_COUNTER_KEY] = next;
    return `${next}-${Math.random().toString(36).slice(2, 10)}`;
  }

  return `${++callbackIdCounter}-${Math.random().toString(36).slice(2, 10)}`;
}
