// Global store for all connection callbacks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalCallbacks = new Map<string, any>();

let callbackIdCounter = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function storeCallbacks(id: string, callbacks: any) {
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
