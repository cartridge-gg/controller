// Global store for all connection callbacks
interface Callbacks {
  resolve?: (result: unknown) => void;
  reject?: (error: unknown) => void;
  onCancel?: () => void;
  [key: string]: unknown;
}

const globalCallbacks = new Map<string, Callbacks>();

let callbackIdCounter = 0;

export function storeCallbacks(id: string, callbacks: Callbacks) {
  globalCallbacks.set(id, callbacks);
}

export function getCallbacks(id: string) {
  return globalCallbacks.get(id);
}

export function cleanupCallbacks(id: string) {
  globalCallbacks.delete(id);
}

export function generateCallbackId(): string {
  return `${++callbackIdCounter}`;
}
